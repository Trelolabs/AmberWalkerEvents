import { routeByPath } from "@/src/content/routes.generated";
import { createSocialImage } from "@/src/lib/social-image";

type RouteContext = { params: Promise<{ slug: string[] }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const route = routeByPath.get(`/${(await params).slug.join("/")}`);
  return route ? createSocialImage(route.title) : new Response("Not found", { status: 404 });
}
