import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amber Walker Events",
  description: "Amber Walker Events website reproduction in progress.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
