import { notFound } from "next/navigation";
import { routeByPath } from "@/src/content/routes.generated";
import { SiteShell } from "./site-shell";

export function ShellPage({ pathname }: { pathname: string }) {
  const route = routeByPath.get(pathname);
  if (!route) notFound();
  return <SiteShell theme={route.theme}><main className="milestone-placeholder"><p>PAGE CONTENT</p><h1>{route.headings[0] || "Amber Walker Events"}</h1></main></SiteShell>;
}
