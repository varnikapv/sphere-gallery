"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import gsap from "gsap";
import { imageUrl, type Project } from "@/lib/projects";

const RADIUS = 10;
const ROW_LATS = [-50, -25, 0, 25, 50]; // latitude band centers (deg)
const COLS = 10;
const LON_STEP = 360 / COLS;
const TILE_PHI = THREE.MathUtils.degToRad(31); // tile width (arc)
const TILE_THETA = THREE.MathUtils.degToRad(19); // tile height (arc)
const MAX_LAT = 58;
const DIM = new THREE.Color(0x666666);
const LIT = new THREE.Color(0xffffff);

// Direction matching THREE.SphereGeometry's vertex parametrisation,
// so lon/lat here and tile phi/theta refer to the same point on the sphere.
function dirFromLonLat(lonDeg: number, latDeg: number, out: THREE.Vector3) {
  const phi = THREE.MathUtils.degToRad(lonDeg);
  const theta = THREE.MathUtils.degToRad(90 - latDeg);
  out.set(
    -Math.cos(phi) * Math.sin(theta),
    Math.cos(theta),
    Math.sin(phi) * Math.sin(theta)
  );
  return out;
}

type TileData = { project: Project; lon: number; lat: number };

export default function SphereGallery({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const mountRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorLabelRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleTextRef = useRef<HTMLHeadingElement>(null);
  const titleMetaRef = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ---------- scene ----------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.touchAction = "none";
    mount.appendChild(renderer.domElement);

    // ---------- tiles ----------
    const manager = new THREE.LoadingManager();
    manager.onProgress = (_url, n, total) =>
      setProgress(Math.round((n / total) * 100));
    const loader = new THREE.TextureLoader(manager);
    loader.setCrossOrigin("anonymous");

    const textures = projects.map((p) => {
      const tex = loader.load(imageUrl(p.seed, 640, 400));
      tex.colorSpace = THREE.SRGBColorSpace;
      // BackSide rendering mirrors the texture — flip it back
      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.x = -1;
      return tex;
    });

    const tiles: THREE.Mesh[] = [];
    let i = 0;
    ROW_LATS.forEach((lat, row) => {
      for (let col = 0; col < COLS; col++) {
        const lon = col * LON_STEP + (row % 2 ? LON_STEP / 2 : 0);
        const theta = THREE.MathUtils.degToRad(90 - lat);
        const phi = THREE.MathUtils.degToRad(lon);
        const geo = new THREE.SphereGeometry(
          RADIUS,
          20,
          12,
          phi - TILE_PHI / 2,
          TILE_PHI,
          theta - TILE_THETA / 2,
          TILE_THETA
        );
        const projIndex = i % projects.length;
        const mat = new THREE.MeshBasicMaterial({
          map: textures[projIndex],
          side: THREE.BackSide,
          color: LIT.clone(),
          transparent: true,
          opacity: 0,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData = { project: projects[projIndex], lon, lat } as TileData;
        scene.add(mesh);
        tiles.push(mesh);
        i++;
      }
    });

    // ---------- view state (lenis-style lerped easing) ----------
    const cur = { lon: 0, lat: 0, fov: 95 };
    const target = { lon: 0, lat: 0 };
    const lookDir = new THREE.Vector3();
    let dragging = false;
    let transitioning = false;
    let lastX = 0;
    let lastY = 0;
    let velX = 0;
    let velY = 0;
    let dragDist = 0;
    let lastInteract = 0;
    let hovered: THREE.Mesh | null = null;
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2(2, 2); // offscreen until first move
    let pointerOnScreen = false;

    const setHover = (mesh: THREE.Mesh | null) => {
      if (mesh === hovered) return;
      hovered = mesh;
      const anyHover = !!mesh;
      tiles.forEach((t) => {
        const m = t.material as THREE.MeshBasicMaterial;
        const to = !anyHover || t === mesh ? LIT : DIM;
        gsap.to(m.color, { r: to.r, g: to.g, b: to.b, duration: 0.45, ease: "power2.out", overwrite: "auto" });
        gsap.to(t.scale, {
          x: t === mesh ? 0.965 : 1,
          y: t === mesh ? 0.965 : 1,
          z: t === mesh ? 0.965 : 1,
          duration: 0.6,
          ease: "power3.out",
          overwrite: "auto",
        });
      });
      // cursor + title overlay
      if (cursorRef.current && cursorLabelRef.current) {
        gsap.to(cursorRef.current, {
          width: anyHover ? 88 : 12,
          height: anyHover ? 88 : 12,
          backgroundColor: anyHover ? "rgba(240,240,240,0.95)" : "rgba(240,240,240,0.9)",
          duration: 0.4,
          ease: "power3.out",
          overwrite: "auto",
        });
        gsap.to(cursorLabelRef.current, { opacity: anyHover ? 1 : 0, duration: 0.3, overwrite: "auto" });
      }
      if (titleRef.current && titleTextRef.current && titleMetaRef.current) {
        if (mesh) {
          const { project } = mesh.userData as TileData;
          titleTextRef.current.textContent = project.title;
          titleMetaRef.current.textContent = `${project.category} — ${project.year}`;
          gsap.fromTo(
            [titleTextRef.current, titleMetaRef.current],
            { yPercent: 120 },
            { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.06, overwrite: "auto" }
          );
          gsap.to(titleRef.current, { opacity: 1, duration: 0.2, overwrite: "auto" });
        } else {
          gsap.to(titleRef.current, { opacity: 0, duration: 0.35, overwrite: "auto" });
        }
      }
      document.body.style.cursor = anyHover ? "none" : "";
    };

    // ---------- pointer handlers ----------
    const el = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      if (transitioning) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velX = 0;
      velY = 0;
      dragDist = 0;
      lastInteract = performance.now();
      try {
        el.setPointerCapture(e.pointerId);
      } catch {} // synthetic events / lost pointers have no active id
      if (cursorRef.current)
        gsap.to(cursorRef.current, { scale: 0.6, duration: 0.3, overwrite: "auto" });
    };
    const onMove = (e: PointerEvent) => {
      pointerOnScreen = true;
      const rect = el.getBoundingClientRect();
      pointerNDC.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
      if (!dragging || transitioning) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      dragDist += Math.abs(dx) + Math.abs(dy);
      // ignore tiny jitters so a click/tap never nudges the camera —
      // otherwise the lerp shifts the view between the hover and click
      // frames and the raycast on pointerup can miss the tile
      if (dragDist <= 4) return;
      target.lon += dx * 0.115;
      target.lat = THREE.MathUtils.clamp(target.lat + dy * 0.085, -MAX_LAT, MAX_LAT);
      velX = dx;
      velY = dy;
      lastInteract = performance.now();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
      // momentum flick — the lerp below eases it out lenis-style
      target.lon += velX * 1.6;
      target.lat = THREE.MathUtils.clamp(target.lat + velY * 1.1, -MAX_LAT, MAX_LAT);
      lastInteract = performance.now();
      if (cursorRef.current)
        gsap.to(cursorRef.current, { scale: 1, duration: 0.3, overwrite: "auto" });
    };
    const onLeave = () => {
      pointerOnScreen = false;
      setHover(null);
    };

    if (cursorRef.current) gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });

    const clickNDC = new THREE.Vector2();
    const onClick = (e: PointerEvent) => {
      if (transitioning) return;
      // ignore click if it was a drag
      if (dragDist > 6) return;
      // raycast at the release point — hover state is cleared while the
      // pointer is down, and touch taps never hover at all
      const rect = el.getBoundingClientRect();
      clickNDC.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(clickNDC, camera);
      const hit = raycaster.intersectObjects(tiles, false)[0];
      if (!hit) return;
      transitioning = true;
      const { project, lon, lat } = hit.object.userData as TileData;
      // nearest lon equivalent (lon is unbounded after dragging)
      const tileLon = lon + 360 * Math.round((cur.lon - lon) / 360);
      const tl = gsap.timeline({
        onComplete: () => router.push(`/gallery/${project.slug}`),
      });
      tl.to(cur, { lon: tileLon, lat, duration: 0.9, ease: "power3.inOut" }, 0);
      tl.to(cur, { fov: 28, duration: 1.0, ease: "power3.inOut" }, 0);
      tl.to(overlayRef.current, { opacity: 1, duration: 0.45, ease: "power2.in" }, 0.55);
      target.lon = tileLon;
      target.lat = lat;
      setHover(null);
      if (cursorRef.current)
        gsap.to(cursorRef.current, { scale: 0, duration: 0.4, overwrite: "auto" });
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerup", onClick);

    // ---------- intro once textures load ----------
    manager.onLoad = () => {
      setLoaded(true);
      gsap.to(cur, { fov: 75, duration: 1.8, ease: "power3.inOut" });
      tiles.forEach((t) => {
        const m = t.material as THREE.MeshBasicMaterial;
        gsap.to(m, {
          opacity: 1,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.3 + Math.random() * 0.7,
          onComplete: () => {
            m.transparent = false;
          },
        });
      });
    };

    // ---------- render loop ----------
    let raf = 0;
    const animate = (t: number) => {
      raf = requestAnimationFrame(animate);
      if (!transitioning) {
        // idle drift after 3s of no interaction
        if (!dragging && t - lastInteract > 3000) target.lon += 0.014;
        cur.lon += (target.lon - cur.lon) * 0.07;
        cur.lat += (target.lat - cur.lat) * 0.07;
      }
      camera.fov = cur.fov;
      camera.updateProjectionMatrix();
      camera.lookAt(dirFromLonLat(cur.lon, cur.lat, lookDir));

      if (!dragging && !transitioning && pointerOnScreen) {
        raycaster.setFromCamera(pointerNDC, camera);
        const hit = raycaster.intersectObjects(tiles, false)[0];
        setHover(hit ? (hit.object as THREE.Mesh) : null);
      } else if (dragging && hovered) {
        setHover(null);
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(animate);

    // ---------- resize ----------
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerup", onClick);
      document.body.style.cursor = "";
      gsap.killTweensOf(cur);
      tiles.forEach((tile) => {
        gsap.killTweensOf(tile.scale);
        gsap.killTweensOf(tile.material);
        gsap.killTweensOf((tile.material as THREE.MeshBasicMaterial).color);
      });
      tiles.forEach((tile) => {
        tile.geometry.dispose();
        (tile.material as THREE.MeshBasicMaterial).dispose();
      });
      textures.forEach((tex) => tex.dispose());
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [projects, router]);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#0a0a0a" }}>
      <div ref={mountRef} className="absolute inset-0" />

      {/* chrome */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-7 mix-blend-difference pointer-events-none">
        <a href="/" className="pointer-events-auto text-[13px] font-medium tracking-[0.25em] uppercase text-white">
          Gallery<sup>®</sup>
        </a>
        <nav className="pointer-events-auto flex gap-8 text-[11px] tracking-[0.22em] uppercase text-white/70">
          <a href="/home#about" className="hover:text-white transition-colors">About</a>
          <a href="/home#contact" className="hover:text-white transition-colors">Contact</a>
        </nav>
      </header>

      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between px-8 pb-8 pointer-events-none">
        {/* hovered project title */}
        <div ref={titleRef} style={{ opacity: 0 }}>
          <div className="overflow-hidden">
            <h2
              ref={titleTextRef}
              className="text-5xl md:text-7xl italic font-light text-white leading-[1.05]"
              style={{ fontFamily: "var(--font-serif)" }}
            />
          </div>
          <div className="overflow-hidden mt-2">
            <p ref={titleMetaRef} className="text-[11px] tracking-[0.25em] uppercase text-white/60" />
          </div>
        </div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-white/40">
          Drag to explore — Click to open
        </p>
      </div>

      {/* vignette */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* custom cursor */}
      <div
        ref={cursorRef}
        className="fixed z-30 pointer-events-none hidden md:flex items-center justify-center rounded-full"
        style={{
          width: 12,
          height: 12,
          left: 0,
          top: 0,
          backgroundColor: "rgba(240,240,240,0.9)",
        }}
      >
        <span
          ref={cursorLabelRef}
          className="text-[10px] tracking-[0.2em] uppercase text-black"
          style={{ opacity: 0 }}
        >
          View
        </span>
      </div>

      {/* loader */}
      {!loaded && (
        <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ background: "#0a0a0a" }}>
          <p className="text-[11px] tracking-[0.35em] uppercase text-white/60">
            Loading {progress}%
          </p>
        </div>
      )}

      {/* page-transition overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-30 pointer-events-none"
        style={{ background: "#0a0a0a", opacity: 0 }}
      />
    </div>
  );
}
