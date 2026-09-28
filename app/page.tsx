import { ShellPage } from "@/components/site-shell/shell-page";
import { routeByPath } from "@/src/content/routes.generated";
import { metadataForRoute } from "@/src/lib/site-metadata";

const homeRoute = routeByPath.get("/")!;
export const metadata = metadataForRoute(homeRoute);

export default function Home() { return <ShellPage pathname="/" />; }
