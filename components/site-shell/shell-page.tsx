import { notFound } from "next/navigation";
import { routeByPath } from "@/src/content/routes.generated";
import { corePageByPath } from "@/src/content/core-pages.generated";
import { CorePage } from "@/components/core-pages/core-page";
import { LocationPage } from "@/components/location-pages/location-page";
import { locationPageByPath } from "@/src/content/location-pages.generated";
import { SiteShell } from "./site-shell";

export function ShellPage({ pathname }: { pathname: string }) {
  const route = routeByPath.get(pathname);
  if (!route) notFound();
  const corePage = corePageByPath.get(pathname);
  const locationPage = locationPageByPath.get(pathname);
  const proposal = locationPage?.family === "proposal" || ["/proposalplanning", "/proposaltips", "/proposalweddingportfolio", "/proposalweddingvideos", "/media"].includes(pathname);
  return <SiteShell theme={route.theme} proposal={proposal}>{corePage ? <CorePage page={corePage} route={route} /> : locationPage ? <LocationPage page={locationPage} /> : <main className="milestone-placeholder"><p>PAGE CONTENT</p><h1>{route.headings[0] || "Amber Walker Events"}</h1></main>}</SiteShell>;
}
