import type { MetadataRoute } from "next";
import { routeRecords } from "@/src/content/routes.generated";

export default function sitemap(): MetadataRoute.Sitemap {
  return routeRecords.map((route) => ({
    url: route.canonical,
    changeFrequency: route.pathname === "/" ? "weekly" : route.pathname.startsWith("/blogs/") ? "monthly" : "yearly",
    priority: route.pathname === "/" ? 1 : route.pathname.startsWith("/blogs/") ? 0.6 : 0.8,
  }));
}
