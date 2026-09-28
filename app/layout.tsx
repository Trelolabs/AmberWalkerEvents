import type { Metadata } from "next";
import "./globals.css";
import { serializeStructuredData, SITE_NAME, SITE_URL } from "@/src/lib/site-metadata";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Luxury Event Planning Across North America | Amber Walker Events", template: `%s | ${SITE_NAME}` },
  description: "Amber Walker Events is a full-service luxury event planning firm serving clients across North America.",
  applicationName: SITE_NAME,
  category: "Event planning",
  referrer: "origin-when-cross-origin",
};

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  email: "info@amberwalkerevents.com",
  telephone: ["+1-647-444-5599", "+1-310-750-4585"],
  sameAs: ["https://www.instagram.com/amberwalkerevents/"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(organization) }} />
        {children}
      </body>
    </html>
  );
}
