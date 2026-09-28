import type { Metadata } from "next";
import type { RouteRecord } from "@/src/content/routes.generated";

export const SITE_URL = "https://www.amberwalkerevents.com";
export const SITE_NAME = "Amber Walker Events";

export function metadataForRoute(route: RouteRecord): Metadata {
  const socialImage = route.pathname === "/" ? `${SITE_URL}/opengraph-image` : `${SITE_URL}/og${route.pathname}`;

  return {
    title: { absolute: route.title },
    description: route.description,
    alternates: { canonical: route.canonical },
    openGraph: {
      title: route.title,
      description: route.description,
      url: route.canonical,
      siteName: SITE_NAME,
      locale: "en_US",
      type: route.pathname.startsWith("/blogs/") ? "article" : "website",
      images: [{ url: socialImage, width: 1200, height: 630, alt: route.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: route.title,
      description: route.description,
      images: [socialImage],
    },
  };
}

export function structuredDataForRoute(route: RouteRecord) {
  if (route.pathname.startsWith("/blogs/")) {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: route.title.replace(/ \| Amber Walker Events$/, ""),
      description: route.description,
      mainEntityOfPage: route.canonical,
      author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      publisher: { "@id": `${SITE_URL}/#organization` },
      image: `${SITE_URL}/og${route.pathname}`,
    };
  }

  if (route.pathname === "/contact" || /planning$/.test(route.pathname)) {
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${route.canonical}/#service`,
      name: SITE_NAME,
      description: route.description,
      url: route.canonical,
      telephone: ["+1-647-444-5599", "+1-310-750-4585"],
      areaServed: ["Canada", "United States"],
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
    };
  }

  return null;
}

export function serializeStructuredData(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
