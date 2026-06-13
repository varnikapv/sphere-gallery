import { notFound } from "next/navigation";
import ProjectDetail from "@/components/gallery/ProjectDetail";
import { projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({
  params,
}: PageProps<"/gallery/[slug]">) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const next = projects[(index + 1) % projects.length];
  return <ProjectDetail project={projects[index]} next={next} />;
}
