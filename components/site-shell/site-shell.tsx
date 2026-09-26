import type { ReactNode } from "react";
import type { SiteTheme } from "@/src/content/routes.generated";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function SiteShell({ children, theme, proposal = false }: { children: ReactNode; theme: SiteTheme; proposal?: boolean }) {
  return <div className="site" data-page-theme={theme}><SiteHeader theme={theme} />{children}<SiteFooter proposal={proposal} /></div>;
}
