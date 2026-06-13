import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Land on the spherical gallery; old home still reachable at /home if needed
  async redirects() {
    return [{ source: "/", destination: "/gallery", permanent: false }];
  },
  // Allow Next.js <Image> to serve SVGs from the public folder
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
