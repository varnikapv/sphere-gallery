import type { Metadata } from "next";
import SphereGallery from "@/components/gallery/SphereGallery";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Gallery — Varnika",
  description: "Selected works — an immersive spherical gallery.",
};

export default function GalleryPage() {
  return <SphereGallery projects={projects} />;
}
