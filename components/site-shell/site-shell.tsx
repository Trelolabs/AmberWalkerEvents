import type { ReactNode } from "react";
import type { SiteTheme } from "@/src/content/routes.generated";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function SiteShell({ children, theme }: { children: ReactNode; theme: SiteTheme }) {
  return <div className="site" data-page-theme={theme}><SiteHeader theme={theme} />{children}<SiteFooter /></div>;
}
