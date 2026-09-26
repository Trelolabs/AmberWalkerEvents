export type NavigationItem = { label: string; href?: string; children?: readonly { label: string; href: string }[] };

export const navigation: readonly NavigationItem[] = [
  { label: "ABOUT", children: [
    { label: "ABOUT AMBER", href: "/meetamber" },
    { label: "THE BRAND", href: "/aboutawe" },
    { label: "MEDIA", href: "/media" },
  ] },
  { label: "EVENT PORTFOLIO", children: [
    { label: "CORPORATE/SOCIAL PHOTO GALLERY", href: "/corporatesocialportfolio" },
    { label: "CORPORATE/SOCIAL VIDEO GALLERY", href: "/corporatesocialvideos" },
    { label: "PROPOSAL/WEDDING PHOTO GALLERY", href: "/proposalweddingportfolio" },
    { label: "PROPOSAL/WEDDING VIDEO GALLERY", href: "/proposalweddingvideos" },
  ] },
  { label: "SERVICES", children: [
    { label: "SOCIAL EVENTS", href: "/socialevents" },
    { label: "CORPORATE EVENTS", href: "/corporateevents" },
    { label: "PROPOSAL PLANNING", href: "/proposalplanning" },
    { label: "WEDDING PLANNING", href: "/weddingplanning" },
  ] },
  { label: "BLOGS", href: "/blog" },
  { label: "CONTACT", href: "/contact" },
];
