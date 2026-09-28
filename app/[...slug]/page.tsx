import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShellPage } from "@/components/site-shell/shell-page";
import { routeByPath, routeRecords } from "@/src/content/routes.generated";
import { metadataForRoute } from "@/src/lib/site-metadata";

type PageProps = { params: Promise<{ slug: string[] }> };
const pathFromSlug = (slug: string[]) => `/${slug.join("/")}`;

export function generateStaticParams() {
  return routeRecords.filter((route) => route.pathname !== "/").map((route) => ({ slug: route.pathname.slice(1).split("/") }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const route = routeByPath.get(pathFromSlug((await params).slug));
  if (!route) return {};
  return metadataForRoute(route);
}

export default async function CapturedRoutePage({ params }: PageProps) {
  const pathname = pathFromSlug((await params).slug);
  if (!routeByPath.has(pathname)) notFound();
  return <ShellPage pathname={pathname} />;
}
