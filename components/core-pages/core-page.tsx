import Image from "next/image";
import Link from "next/link";
import type { CoreMedia, CorePageRecord } from "@/src/content/core-pages.generated";
import type { RouteRecord } from "@/src/content/routes.generated";
import { GoodCompanySection } from "./good-company-section";
import { HomeHeroCarousel } from "./home-hero-carousel";

const galleryPaths = new Set(["/corporatesocialportfolio", "/proposalweddingportfolio"]);
const videoPaths = new Set(["/corporatesocialvideos", "/proposalweddingvideos", "/media"]);
const servicePaths = new Set(["/corporateevents", "/socialevents", "/proposalplanning", "/weddingplanning"]);

function images(page: CorePageRecord) { return page.media.filter((media) => media.type.startsWith("image/")); }
function videos(page: CorePageRecord) { return page.media.filter((media) => media.type.startsWith("video/")); }
function paragraphs(page: CorePageRecord) { return page.lines.filter((line) => line.length > 90); }

function MediaImage({ media, alt, priority = false }: { media: CoreMedia; alt: string; priority?: boolean }) {
  return <Image src={media.src} alt={alt} fill sizes="(max-width: 767px) 100vw, 50vw" priority={priority} />;
}

function Hero({ page, title, kicker }: { page: CorePageRecord; title: string; kicker?: string }) {
  const video = videos(page)[0];
  const image = images(page)[0];
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

function HomePage({ page }: { page: CorePageRecord }) {
  const body = paragraphs(page)[0];
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
  const body = paragraphs(page).slice(0, 4);
  const supporting = images(page).slice(1, 7);
  return <main className="service-page">
    <Hero page={page} title={title} kicker={page.lines.includes("SERVING WORLDWIDE") ? "SERVING WORLDWIDE" : undefined} />
    <section className="service-copy">{body.map((text) => <p key={text}>{text}</p>)}</section>
    {supporting.length ? <section className="supporting-gallery">{supporting.map((media, index) => <div key={media.src}><MediaImage media={media} alt={`${title} example ${index + 1}`} /></div>)}</section> : null}
  </main>;
}

function AboutPage({ page, route }: { page: CorePageRecord; route: RouteRecord }) {
  const pageImages = images(page);
  const portrait = pageImages.find((media) => media.src.includes("a14ee68")) || pageImages[0];
  const copy = paragraphs(page);
  const title = page.lines.find((line) => line === "MEET AMBER" || line === "THE BRAND") || route.title;
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
  return <main className="contact-page"><h1>CONTACT</h1><div className="contact-locations"><section><h2>CALIFORNIA</h2><p>2210 Main Street, Unit 108<br />Santa Monica, CA<br />Phone: (310) 750 - 4585</p></section><section><h2>TORONTO</h2><p>72 Berkeley Street<br />Toronto<br />Phone: (647) 444 - 5599</p></section></div><form className="contact-form"><label>NAME<input name="name" autoComplete="name" /></label><label>EMAIL<input name="email" type="email" autoComplete="email" /></label><label>EVENT TYPE<select name="eventType" defaultValue=""><option value="" disabled>Select an event</option><option>Corporate Event</option><option>Social Event</option><option>Wedding Planning</option><option>Proposal Planning</option></select></label><label>MESSAGE<textarea name="message" rows={5} /></label><button type="submit">SUBMIT</button></form></main>;
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
  </main>;
}

function EditorialPage({ page, route }: { page: CorePageRecord; route: RouteRecord }) {
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
