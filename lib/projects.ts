export type Project = {
  slug: string;
  title: string;
  category: string;
  year: string;
  seed: string;
};

const CATEGORIES = [
  "Interactive Installation",
  "Web Experience",
  "Brand & Motion",
  "Generative Audio",
  "WebGL Game",
  "AR Experience",
  "Editorial Design",
  "Data Visualisation",
  "Film & Direction",
  "Creative Coding",
];

// 50 titles — one per tile on the sphere (5 rows × 10 cols), no repeats
const TITLES = [
  "Aurora Grid", "Midnight Atlas", "Terra Form", "Echo Chamber", "Paper Planes",
  "Neon Botany", "Silk Roads", "Gravity Well", "Halcyon Days", "Static Bloom",
  "Vapor Trails", "Iron Garden", "Glass Harbor", "Solar Drift", "Quiet Machines",
  "Velvet Circuit", "Ember Field", "Lunar Tide", "Cobalt Dream", "Wild Signal",
  "Hollow Light", "Cinder Path", "Opal Coast", "Feral Code", "Marble Sky",
  "Dusk Protocol", "Salt and Stone", "Hidden Meridian", "Amber Static", "Night Garden",
  "Polar Echo", "Rust Bloom", "Mirage Engine", "Soft Thunder", "Pale Horizon",
  "Drift Theory", "Crystal Noise", "Slow Motion", "North of Nowhere", "Sugar Glass",
  "Bone China", "Liquid Sun", "Phantom Limb", "Honey Trap", "Smoke Signal",
  "Winter Index", "Coral Archive", "Tidal Memory", "Violet Hour", "Last Light",
];

export const projects: Project[] = TITLES.map((title, i) => {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    slug,
    title,
    category: CATEGORIES[i % CATEGORIES.length],
    year: String(2025 - (i % 5)),
    seed: slug,
  };
});

export const imageUrl = (seed: string, w = 800, h = 500) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;
