import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.amberwalkerevents.com"),
  title: "Luxury Event Planning Across North America | Amber Walker Events",
  description: "Amber Walker Events is a full-service luxury event planning firm serving clients across North America.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
