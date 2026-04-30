import type { MetadataRoute } from "next";

const routes = [
  "/",
  "/app",
  "/app/about",
  "/app/onboarding",
  "/app/policies",
  "/app/runs",
  "/app/swarm",
  "/app/evidence",
  "/app/settings"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "hourly" : "daily",
    priority: route === "/" ? 1 : route === "/app" ? 0.9 : 0.7
  }));
}
