"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { imageUrl, type Project } from "@/lib/projects";

export default function ProjectDetail({
  project,
  next,
}: {
  project: Project;
  next: Project;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        "[data-hero-img]",
        { scale: 1.25, clipPath: "inset(18% 12% 18% 12%)" },
        { scale: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power3.inOut" }
      );
      tl.fromTo(
        "[data-rise]",
        { yPercent: 120 },
        { yPercent: 0, duration: 0.9, stagger: 0.08 },
        "-=0.55"
      );
      tl.fromTo(
        "[data-fade]",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
        "-=0.5"
      );
    }, root);
    return () => ctx.revert();
  }, [project.slug]);

  return (
    <div ref={rootRef} className="min-h-screen" style={{ background: "#0a0a0a", color: "#f0f0f0" }}>
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-7 mix-blend-difference">
        <Link href="/gallery" className="text-[11px] tracking-[0.25em] uppercase text-white/80 hover:text-white transition-colors">
          ← Back to gallery
        </Link>
        <span className="text-[13px] font-medium tracking-[0.25em] uppercase text-white">
          Gallery<sup>®</sup>
        </span>
      </header>

      {/* hero */}
      <section className="relative h-[72vh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-hero-img
          src={imageUrl(project.seed, 1600, 1000)}
          alt={project.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.85), transparent 45%)" }} />
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-10">
          <div className="overflow-hidden">
            <p data-rise className="text-[11px] tracking-[0.3em] uppercase text-white/60 mb-3">
              {project.category} — {project.year}
            </p>
          </div>
          <div className="overflow-hidden">
            <h1
              data-rise
              className="text-6xl md:text-8xl italic font-light leading-[1.02]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {project.title}
            </h1>
          </div>
        </div>
      </section>

      {/* body — basic template */}
      <section className="px-8 py-20 max-w-3xl">
        <p data-fade className="text-lg leading-relaxed text-white/70">
          {project.title} is a {project.category.toLowerCase()} exploring the boundary between
          digital craft and physical space. This page is a template — case study content,
          process imagery, and credits would live here.
        </p>
        <div data-fade className="mt-12 grid grid-cols-2 gap-8 text-[11px] tracking-[0.22em] uppercase text-white/50">
          <div>
            <p className="text-white/30 mb-2">Role</p>
            <p>Design & Development</p>
          </div>
          <div>
            <p className="text-white/30 mb-2">Year</p>
            <p>{project.year}</p>
          </div>
        </div>
      </section>

      {/* next project */}
      <Link href={`/gallery/${next.slug}`} className="block px-8 pb-24 group">
        <p data-fade className="text-[11px] tracking-[0.3em] uppercase text-white/40 mb-3">
          Next project
        </p>
        <p
          data-fade
          className="text-4xl md:text-6xl italic font-light text-white/70 group-hover:text-white transition-colors duration-500"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {next.title} →
        </p>
      </Link>
    </div>
  );
}
