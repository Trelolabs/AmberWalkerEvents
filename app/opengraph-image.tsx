import { routeByPath } from "@/src/content/routes.generated";
import { createSocialImage, socialImageSize } from "@/src/lib/social-image";

export const alt = "Amber Walker Events — Luxury event planning across North America";
export const size = socialImageSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createSocialImage(routeByPath.get("/")?.title || "Amber Walker Events");
}
