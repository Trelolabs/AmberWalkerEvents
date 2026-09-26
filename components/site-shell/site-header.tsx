"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SiteTheme } from "@/src/content/routes.generated";
import { navigation } from "@/src/lib/site-navigation";

const logos = {
  dark: "/media/home/display/header-logo.avif",
  lilac: "/media/home/display/header-logo.avif",
  light: "/media/home/78396c-4652a19336e34b93a3b3e5c3e0ee34e5-mv2-f46d33b26b.png",
} satisfies Record<SiteTheme, string>;

export function SiteHeader({ theme }: { theme: SiteTheme }) {
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setCompact(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <><span ref={sentinelRef} className="site-header-sentinel" aria-hidden="true" /><header className={`site-header${compact ? " is-compact" : ""}`} data-theme={theme}>
      <div className="brand-lockup">
        <Link href="/" aria-label="Amber Walker Events home">
          <Image className="brand-logo" src={logos[theme]} width={367} height={184} priority unoptimized={theme !== "light"} alt="Amber Walker Events" />
        </Link>
      </div>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <ul>{navigation.map((item) => (
          <li key={item.label} className={item.children ? "has-submenu" : undefined}>
            {item.href ? <Link href={item.href}>{item.label}</Link> : <button type="button">{item.label}</button>}
            {item.children ? <ul className="submenu">{item.children.map((child) => (
              <li key={child.href}><Link href={child.href}>{child.label}</Link></li>
            ))}</ul> : null}
          </li>
        ))}</ul>
      </nav>
      <details className="mobile-nav">
        <summary>SERVICES</summary>
        <nav aria-label="Mobile navigation">{navigation.map((item) => (
          <div className="mobile-nav-group" key={item.label}>
            {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
            {item.children?.map((child) => <Link key={child.href} href={child.href}>{child.label}</Link>)}
          </div>
        ))}</nav>
      </details>
    </header></>
  );
}
