import Image from "next/image";
import Link from "next/link";
import type { CoreMedia, CorePageRecord } from "@/src/content/core-pages.generated";
import type { RouteRecord } from "@/src/content/routes.generated";
import { GoodCompanySection } from "./good-company-section";
import { HomeHeroCarousel } from "./home-hero-carousel";

const pressLogos = [
  ["US Weekly", "/media/home/display/press-01.avif"],
  ["Good Night New York", "/media/home/display/press-02.avif"],
  ["Toronto Sun", "/media/home/display/press-03.avif"],
  ["Fashion", "/media/home/display/press-04.avif"],
  ["Breakfast Television", "/media/home/display/press-05.avif"],
  ["The New York Times", "/media/home/display/press-06.avif"],
  ["CP24", "/media/home/display/press-07.avif"],
  ["Daily Mail", "/media/home/display/press-08.avif"],
  ["Brides", "/media/home/display/press-09.avif"],
  ["Toronto Star", "/media/home/display/press-10.avif"],
  ["New You", "/media/home/display/press-11.avif"],
  ["The Knot", "/media/home/display/press-12.avif"],
  ["Narcity", "/media/home/display/press-13.avif"],
  ["National Post", "/media/home/display/press-14.avif"],
  ["LA Inquisitor", "/media/home/display/press-15.avif"],
  ["Entertainment Tonight", "/media/home/display/press-16.avif"],
  ["Hollywood", "/media/home/display/press-17.avif"],
  ["Living Luxe", "/media/home/display/press-18.avif"],
  ["Cityline", "/media/home/display/press-19.avif"],
  ["Millennium", "/media/home/display/press-20.avif"],
  ["Event Gurus", "/media/home/display/press-21.avif"],
] as const;

const galleryPaths = new Set(["/corporatesocialportfolio", "/proposalweddingportfolio"]);
const videoPaths = new Set(["/corporatesocialvideos", "/proposalweddingvideos", "/media"]);
const servicePaths = new Set(["/corporateevents", "/socialevents", "/proposalplanning", "/weddingplanning"]);
const eventPlans = {
  "/corporateevents": ["CORPORATE GALAS", "AWARD CEREMONIES", "PRODUCT LAUNCHES", "GRAND OPENINGS", "TRADE SHOWS & EXPOS", "CONFERENCES", "SUMMITS & RETREATS", "ANNIVERSARIES & MILESTONES", "BRAND ACTIVATIONS", "CLIENT APPRECIATION", "HOLIDAY PARTIES", "VIP EXPERIENCES"],
  "/socialevents": ["MILESTONE BIRTHDAY PARTIES", "CHARITY GALAS", "BAR MITZVAHS / BAT MITZVAHS", "ANNIVERSARY CELEBRATION", "ENGAGEMENT PARTIES", "BABY SHOWER", "BRIDAL SHOWER", "BACHELOR PARTY", "BACHELORETTE PARTY", "PRIVATE DINNERS", "COCKTAIL PARTIES", "HOLIDAY PARTIES"],
} as const;
const proposalLocations = [
  ["LAGUNA BEACH", "/lagunabeachproposalplanning"], ["NEWPORT BEACH", "/newportbeachproposalplanning"], ["LOS ANGELES", "/losangelesproposalplanning"],
  ["CHICAGO", "/chicagoproposalplanning"], ["MIAMI", "/miamiproposalplanning"], ["TORONTO", "/torontoproposalplanning"], ["DALLAS", "/dallasproposalplanning"],
  ["LAS VEGAS", "/lasvegasproposalplanning"], ["NASHVILLE", "/nashvilleproposalplanning"], ["SCOTTSDALE", "/scottsdaleproposalplanning"],
  ["HAWAII", "/hawaiiproposalplanning"], ["PUERTO RICO", "/puertoricoproposalplanning"], ["CAYMAN ISLANDS", "/caymanislandsproposalplanning"],
  ["NEW YORK", "/newyorkpropsalplanning"], ["AUSTIN", "/austinproposalplanning"], ["PALM BEACH", "/palmbeachproposalplanning"],
  ["PALM SPRINGS", "/palmspringsproposalplanning"], ["HOUSTON", "/houstonproposalplanning"], ["VANCOUVER", "/vancouverproposalplanning"],
  ["MUSKOKA", "/muskokaproposalplanning"], ["WHISTLER", "/whistlerproposalplanning"],
] as const;

function images(page: CorePageRecord) { return page.media.filter((media) => media.type.startsWith("image/")); }
function videos(page: CorePageRecord) { return page.media.filter((media) => media.type.startsWith("video/")); }
function paragraphs(page: CorePageRecord) { return page.lines.filter((line) => line.length > 90); }

function MediaImage({ media, alt, priority = false }: { media: CoreMedia; alt: string; priority?: boolean }) {
  return <Image src={media.src} alt={alt} fill sizes="(max-width: 767px) 100vw, 50vw" priority={priority} loading={priority ? undefined : "eager"} unoptimized />;
}

function Hero({ page, title, kicker }: { page: CorePageRecord; title: string; kicker?: string }) {
  const video = videos(page)[0];
  const pageImages = images(page);
  const image = pageImages.find((media) => media.source.includes("f000")) || pageImages[0];
  return (
    <section className="core-hero">
      <div className="core-hero-media">
        {video ? <video src={video.src} poster={image?.src} autoPlay muted loop playsInline /> : image ? <MediaImage media={image} alt="" priority /> : null}
      </div>
      <div className="core-hero-shade" />
      <div className="core-hero-copy">
        <h1>{title}</h1>
        {kicker ? <p>{kicker}</p> : null}
        <Link href="/contact">Let&apos;s Discuss Your Event</Link>
      </div>
    </section>
  );
}

function ServicePress({ tone = "dark", media }: { tone?: "dark" | "lilac" | "light"; media?: CoreMedia[] }) {
  const logos = media?.map((logo, index) => [`Press logo ${index + 1}`, logo.src] as const) || pressLogos;
  return <section className={`service-press ${tone}`}><h2>AS SEEN ON</h2><div>{logos.map(([alt, src]) => <span key={src}><Image src={src} alt={alt} fill sizes="100px" unoptimized /></span>)}</div></section>;
}

function ServicePlanning({ media, labels }: { media: CoreMedia[]; labels: readonly string[] }) {
  return <section className="service-planning"><h2>WHAT WE PLAN</h2><p>THOUGHTFUL PLANNING. IMPECCABLE EXECUTION. UNFORGETTABLE EXPERIENCES.</p><div>{labels.map((label, index) => <article key={label}>{media[index] ? <MediaImage media={media[index]} alt={label} /> : <span>{label}</span>}</article>)}</div></section>;
}

function ServiceShowcase({ media }: { media: CoreMedia[] }) {
  return media.length ? <section className="service-showcase">{media.map((image, index) => <div key={image.src}><MediaImage media={image} alt={`Event showcase ${index + 1}`} /></div>)}</section> : null;
}

function ServiceCta() {
  return <section className="service-cta"><h2>LET&apos;S CREATE SOMETHING UNFORGETTABLE</h2><Link href="/contact">SCHEDULE NOW</Link></section>;
}

function ServicePortfolioLinks({ proposal = false }: { proposal?: boolean }) {
  return <nav className={`service-portfolio-links${proposal ? " proposal" : ""}`}><Link href={proposal ? "/proposalweddingportfolio" : "/corporatesocialportfolio"}>CLICK HERE FOR PHOTO GALLERY</Link><Link href={proposal ? "/proposalweddingvideos" : "/corporatesocialvideos"}>CLICK HERE FOR VIDEO GALLERY</Link></nav>;
}

function HomePage({ page }: { page: CorePageRecord }) {
  const body = paragraphs(page)[0];
  const services = [
    ["EXCLUSIVE SOCIAL EVENTS", "/socialevents", "/media/home/display/service-social.avif"],
    ["BESPOKE CORPORATE EVENTS", "/corporateevents", "/media/home/display/service-corporate.avif"],
    ["CUSTOM PROPOSAL PLANNING", "/proposalplanning", "/media/home/display/service-proposal.avif"],
    ["LUXURY WEDDING PLANNING", "/weddingplanning", "/media/home/display/service-wedding.avif"],
  ] as const;
  return <main className="home-page">
    <HomeHeroCarousel />
    <section className="home-philosophy"><h1>AMBER WALKER EVENTS PHILOSOPHY</h1><span className="section-rule" />{body ? <p>{body}</p> : null}</section>
    <section className="press-section"><h2>AS SEEN ON</h2><div className="logo-grid">{pressLogos.map(([alt, src]) => <div key={src}><Image src={src} alt={alt} fill sizes="100px" unoptimized /></div>)}</div></section>
    <section className="services-overview"><h2>A FULL SERVICE EVENT PLANNING FIRM</h2><span className="section-rule" /><div className="service-card-grid">{services.map(([label, href, src]) => <Link href={href} key={href} className="service-card"><Image src={src} alt="" fill sizes="265px" unoptimized /><span>{label}</span></Link>)}</div></section>
    <GoodCompanySection />
  </main>;
}

function ServicePage({ page, route }: { page: CorePageRecord; route: RouteRecord }) {
  const title = page.lines.find((line) => ["CORPORATE EVENTS", "SOCIAL EVENTS", "PROPOSAL PLANNING", "WEDDING PLANNING"].includes(line)) || route.headings[0] || route.title;
  const pageImages = images(page);
  const hero = <Hero page={page} title={title} kicker={page.lines.includes("SERVING WORLDWIDE") ? "SERVING WORLDWIDE" : undefined} />;

  if (route.pathname === "/corporateevents" || route.pathname === "/socialevents") {
    const labels = eventPlans[route.pathname];
    const showcaseTokens = route.pathname === "/corporateevents" ? ["faa16b9d", "9130be9b"] : ["ada3d921", "b87a0c02"];
    const showcase = showcaseTokens.map((token) => pageImages.find((media) => media.src.includes(token))).filter((media): media is CoreMedia => Boolean(media));
    return <main className={`service-page event-service-page ${route.pathname === "/socialevents" ? "social-event-page" : "corporate-event-page"}`}>
      {hero}
      <section className="service-copy service-intro">{paragraphs(page).slice(0, 3).map((text) => <p key={text}>{text}</p>)}</section>
      <ServicePress />
      <ServicePlanning media={pageImages.slice(23, 35)} labels={labels} />
      <ServiceShowcase media={showcase} />
      <ServiceCta />
      <GoodCompanySection />
      <ServicePortfolioLinks />
    </main>;
  }

  if (route.pathname === "/weddingplanning") {
    const weddingCopy = page.lines.slice(9, 22).filter((line) => line.replaceAll("​", "").trim());
    return <main className="service-page wedding-service-page">
      {hero}
      <section className="service-copy service-intro">{[page.lines[3], page.lines[5], page.lines[7]].filter(Boolean).map((text) => <p key={text}>{text}</p>)}</section>
      <section className="wedding-service-feature"><div><h2>WHERE LOVE MEETS LUXURY</h2>{weddingCopy.map((text) => <p key={text}>{text}</p>)}</div><div className="wedding-service-image">{pageImages[3] ? <MediaImage media={pageImages[3]} alt="Luxury wedding reception" /> : null}<Link href="/contact">CALL US NOW</Link></div></section>
      <ServiceShowcase media={pageImages.slice(4, 7)} />
      <ServicePress tone="light" />
      <GoodCompanySection />
    </main>;
  }

  const packageItems = page.lines.slice(7, 23).filter((line) => line.replaceAll("​", "").trim());
  return <main className="service-page proposal-service-page">
    {hero}
    <section className="service-copy service-intro">{[page.lines[3], page.lines[4]].map((text) => <p key={text}>{text}</p>)}</section>
    <ServicePress tone="lilac" />
    <section className="service-proposal-package">{pageImages[23] ? <MediaImage media={pageImages[23]} alt="Proposal setting" /> : null}<div><h2>PROPOSAL PLANNING PACKAGE</h2>{packageItems.map((text) => <p key={text}>{text}</p>)}<Link href="/contact">CONTACT US FOR A FREE CONSULTATION</Link></div></section>
    <section className="proposal-location-selector"><h2>CHOOSE YOUR PROPOSAL LOCATION</h2><div>{proposalLocations.map(([label, href], index) => <Link href={href} key={href} aria-label={label}>{pageImages[index + 24] ? <MediaImage media={pageImages[index + 24]} alt="" /> : <span>{label}</span>}</Link>)}</div></section>
    <GoodCompanySection />
    <ServicePortfolioLinks proposal />
  </main>;
}

function AboutPage({ page, route }: { page: CorePageRecord; route: RouteRecord }) {
  const pageImages = images(page);
  const portrait = pageImages.find((media) => media.src.includes("a14ee68")) || pageImages[0];
  const copy = paragraphs(page);
  const title = page.lines.find((line) => line === "MEET AMBER" || line === "THE BRAND") || route.title;
  if (route.pathname === "/aboutawe") return <main className="about-page brand-page">
    <section className="brand-layout"><div className="brand-copy"><h1>{title}</h1><p>{page.lines[1]}</p><p>{page.lines[2]}</p><ul>{page.lines.slice(3, 7).map((text) => <li key={text}>{text}</li>)}</ul><p>{page.lines[8]}</p><ul>{page.lines.slice(9, 14).map((text) => <li key={text}>{text}</li>)}</ul></div><div className="brand-image">{pageImages[1] ? <MediaImage media={pageImages[1]} alt="Amber Walker Events celebration" priority /> : null}</div></section>
    <ServicePress tone="light" />
  </main>;
  return <main className="about-page"><section className="about-layout"><div className="about-image">{portrait ? <MediaImage media={portrait} alt={title} priority /> : null}</div><div className="about-copy"><h1>{title}</h1>{copy.map((text) => <p key={text}>{text}</p>)}</div></section></main>;
}

function GalleryPage({ page, route }: { page: CorePageRecord; route: RouteRecord }) {
  const pageImages = images(page).filter((media) => !media.src.includes("11062b-")).slice(0, 36);
  const heading = route.pathname === "/proposalweddingportfolio" ? "PROPOSAL GALLERY" : "EVENT PORTFOLIO";
  return <main className="gallery-page"><h1>{heading}</h1><section className="gallery-grid">{pageImages.map((media, index) => <figure key={media.src}><MediaImage media={media} alt={`${heading} image ${index + 1}`} /></figure>)}</section></main>;
}

function VideoPage({ page, route }: { page: CorePageRecord; route: RouteRecord }) {
  const pageVideos = videos(page);
  const posters = images(page);
  const heading = route.pathname === "/corporatesocialvideos" ? "EVENT PORTFOLIO" : route.pathname === "/media" ? "MEDIA" : "PROPOSAL VIDEO GALLERY";
  return <main className="video-page"><h1>{heading}</h1><section className="video-grid">{(pageVideos.length ? pageVideos : posters.slice(0, 6)).map((media, index) => <div className="video-frame" key={media.src}>{media.type.startsWith("video/") ? <video src={media.src} poster={posters[index]?.src} controls preload="metadata" /> : <MediaImage media={media} alt={`${heading} feature ${index + 1}`} />}</div>)}</section></main>;
}

function BlogPage({ page }: { page: CorePageRecord }) {
  const titles = ["Chicago Proposal", "Alice in Wonderland", "Amber Walker Designs", "Miami Wedding", "Urban Planet", "HBNG", "CN Tower", "The Oscars", "Living Luxe Design Show", "Canaroma", "Nagarro", "AJ Minter", "AMG"];
  const cards = images(page).slice(0, titles.length);
  return <main className="blog-page"><h1>BLOG</h1><section className="blog-grid">{titles.map((title, index) => <Link href={`/blogs/${["chicagoproposal","aliceinwonderland","amberwalkerdesigns","miamiwedding","urbanplanet","hbng","cntower","oscars","llds","canaroma","nagarro","ajminter","amg"][index]}`} key={title}><div>{cards[index] ? <MediaImage media={cards[index]} alt="" /> : null}</div><h2>{title}</h2><span>View Story</span></Link>)}</section></main>;
}

function ContactPage() {
  return <main className="contact-page"><div className="contact-locations"><section><h1>CALIFORNIA</h1><p>2219 Main Street, Unit 198,<br />Santa Monica, California<br /><strong>Phone: (310) 750 - 4585</strong></p><div aria-hidden="true" /></section><section><h1>TORONTO</h1><p>27 Bathurst Street,<br />Toronto, Ontario<br /><strong>Phone: (647) 444 - 5599</strong></p><div aria-hidden="true" /></section></div></main>;
}

function LegacySocialPage({ page }: { page: CorePageRecord }) {
  const testimonial = page.lines.find((line) => line.startsWith("Amber was fantastic"));
  const galleryImages = images(page).slice(5, 7);
  return <main className="legacy-social-page">
    <h1>BACHELOR/ETTE</h1>
    <section className="legacy-social-intro" aria-label="Bachelor and bachelorette event services">
      <div className="legacy-social-placeholder" />
      <div className="legacy-social-placeholder" />
      {["dark", "light"].map((tone) => <article className={`legacy-social-testimonial ${tone}`} key={tone}>
        <span className="section-rule" />
        {testimonial ? <p>{testimonial}</p> : null}
        <p>Meghan Spiteri<br />Shoppers World Brampton, RioCan</p>
        <Link href="/contact">SCHEDULE NOW</Link>
        <span className="section-rule" />
      </article>)}
    </section>
    <section className="legacy-social-gallery">{galleryImages.map((media, index) => <div key={media.src}><MediaImage media={media} alt={`Bachelor and bachelorette event ${index + 1}`} /></div>)}</section>
    <section className="legacy-social-cta"><h2>SCHEDULE A CALL WITH AMBER NOW</h2><Link href="/contact">SCHEDULE NOW</Link></section>
    <section className="legacy-social-portfolio"><h2>VIEW OUR EVENT PORTFOLIO</h2><Link href="/corporatesocialportfolio">CLICK HERE</Link></section>
  </main>;
}

function EditorialPage({ page, route }: { page: CorePageRecord; route: RouteRecord }) {
  if (route.pathname === "/proposaltips") {
    const pageImages = images(page);
    return <main className="editorial-page proposal-tips-page">
      <Hero page={page} title="LAGUNA BEACH PROPOSAL PLANNING" />
      <section className="service-copy service-intro">{[page.lines[1], page.lines[2]].map((text) => <p key={text}>{text}</p>)}</section>
      <section className="proposal-tips-feature">{pageImages[2] ? <MediaImage media={pageImages[2]} alt="Oceanfront proposal setting" /> : null}<div><h2>PROPOSAL PLANNING TIPS</h2><Link href="/contact">CONTACT US FOR A FREE CONSULTATION</Link></div></section>
      <ServicePress media={pageImages.slice(3, 17)} tone="lilac" />
      <ServiceShowcase media={pageImages.slice(17, 20)} />
      <section className="proposal-review"><h2>WHAT PEOPLE SAY ABOUT US</h2><blockquote>{page.lines[7]}<cite>{page.lines[8]}</cite></blockquote><nav><Link href="/proposalweddingportfolio">CLICK HERE FOR PHOTO GALLERY</Link><Link href="/proposalweddingvideos">CLICK HERE FOR VIDEO GALLERY</Link></nav></section>
    </main>;
  }
  return <main className="editorial-page"><Hero page={page} title={page.lines.find((line) => line.length < 55 && line === line.toUpperCase()) || route.title} /><section className="service-copy">{paragraphs(page).map((text) => <p key={text}>{text}</p>)}</section></main>;
}

export function CorePage({ page, route }: { page: CorePageRecord; route: RouteRecord }) {
  if (route.pathname === "/") return <HomePage page={page} />;
  if (servicePaths.has(route.pathname)) return <ServicePage page={page} route={route} />;
  if (route.pathname === "/meetamber" || route.pathname === "/aboutawe") return <AboutPage page={page} route={route} />;
  if (galleryPaths.has(route.pathname)) return <GalleryPage page={page} route={route} />;
  if (videoPaths.has(route.pathname)) return <VideoPage page={page} route={route} />;
  if (route.pathname === "/blog") return <BlogPage page={page} />;
  if (route.pathname === "/contact") return <ContactPage />;
  if (route.pathname === "/copy-of-social-events") return <LegacySocialPage page={page} />;
  return <EditorialPage page={page} route={route} />;
}
