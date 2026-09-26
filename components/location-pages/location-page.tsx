import Image from "next/image";
import Link from "next/link";
import type { LocationMedia, LocationPageRecord } from "@/src/content/location-pages.generated";

const images = (page: LocationPageRecord) => page.media.filter((media) => media.type.startsWith("image/"));
const videos = (page: LocationPageRecord) => page.media.filter((media) => media.type.startsWith("video/"));
const paragraphs = (page: LocationPageRecord) => page.lines.filter((line) => line.length > 90);
const planningLabels = ["CORPORATE GALAS", "AWARD CEREMONIES", "PRODUCT LAUNCHES", "GRAND OPENINGS", "TRADE SHOWS & EXPOS", "CONFERENCES", "SUMMITS & RETREATS", "ANNIVERSARIES & MILESTONES", "BRAND ACTIVATIONS", "CLIENT APPRECIATION", "HOLIDAY PARTIES", "VIP EXPERIENCES"];
const corporateCardTokens = ["8f49b846", "cd716379", "0cc0aec4", "12175dbb", "56c91e96", "e48a89ca", "542a9da4", "82f90ce3", "fbf9d220", "a6f7e58e", "01e8d09c", "0f5603a5"];
const corporateGalleryTokens = ["faa16b9d", "9130be9b"];
const weddingGalleryTokens = ["87439f31", "e8444f2c", "b2d69de4"];
const selectMedia = (media: LocationMedia[], tokens: string[]) => tokens.map((token) => media.find((item) => item.src.includes(token))).filter((item): item is LocationMedia => Boolean(item));
const proposalMediaByRoute: Record<string, { background: string; gallery: string[] }> = {
  "/austinproposalplanning": { background: "e8444f2c", gallery: ["71850379", "df8f5f50", "2e882e78"] },
  "/caymanislandsproposalplanning": { background: "e8444f2c", gallery: ["87439f31", "bb74d201", "51390383"] },
  "/chicagoproposalplanning": { background: "390fbcf7", gallery: ["87439f31", "298e17a6", "f4899d47"] },
  "/dallasproposalplanning": { background: "e8444f2c", gallery: ["71850379", "df8f5f50", "2e882e78"] },
  "/hawaiiproposalplanning": { background: "e8444f2c", gallery: ["87439f31", "bb74d201", "51390383"] },
  "/houstonproposalplanning": { background: "e8444f2c", gallery: ["87439f31", "390fbcf7", "37f51726"] },
  "/lagunabeachproposalplanning": { background: "e8444f2c", gallery: ["87439f31", "bb74d201", "51390383"] },
  "/lasvegasproposalplanning": { background: "390fbcf7", gallery: ["87439f31", "298e17a6", "f4899d47"] },
  "/losangelesproposalplanning": { background: "48f641f3", gallery: ["87439f31", "8c4df80b", "df8f5f50"] },
  "/miamiproposalplanning": { background: "e8444f2c", gallery: ["87439f31", "e8444f2c", "b2d69de4"] },
  "/muskokaproposalplanning": { background: "390fbcf7", gallery: ["87439f31", "298e17a6", "df8f5f50"] },
  "/nashvilleproposalplanning": { background: "e8444f2c", gallery: ["71850379", "df8f5f50", "2e882e78"] },
  "/newportbeachproposalplanning": { background: "e8444f2c", gallery: ["87439f31", "bb74d201", "51390383"] },
  "/newyorkpropsalplanning": { background: "390fbcf7", gallery: ["87439f31", "298e17a6", "f4899d47"] },
  "/palmbeachproposalplanning": { background: "e8444f2c", gallery: ["87439f31", "e8444f2c", "b2d69de4"] },
  "/palmspringsproposalplanning": { background: "48f641f3", gallery: ["87439f31", "8c4df80b", "df8f5f50"] },
  "/puertoricoproposalplanning": { background: "e8444f2c", gallery: ["87439f31", "bb74d201", "51390383"] },
  "/scottsdaleproposalplanning": { background: "e8444f2c", gallery: ["71850379", "df8f5f50", "2e882e78"] },
  "/torontoproposalplanning": { background: "390fbcf7", gallery: ["87439f31", "298e17a6", "df8f5f50"] },
  "/vancouverproposalplanning": { background: "37952bce", gallery: ["d676c782", "37f51726", "b201507c"] },
  "/whistlerproposalplanning": { background: "37952bce", gallery: ["d676c782", "37f51726", "b201507c"] },
};
const pressLogos = [
  ["Us Weekly", "/media/home/1a6711-2afe3389827e4ddfbf73bbb2ed3ea320-mv2-ffd6a501d1.png"],
  ["Good Night New York", "/media/home/1a6711-d70d483c5d5648f0afd63bf6bc03207d-mv2-0b04385aa5.png"],
  ["Toronto Sun", "/media/home/1a6711-df348b60d673462fb30d271b2b51c857-mv2-1bde3a1eb5.png"],
  ["Fashion", "/media/home/1a6711-b06b162fdb2040939a275384f8381458-mv2-ec3ad0581f.png"],
  ["Breakfast Television", "/media/home/1a6711-d9b4d29c58514e07a8701040ba6b7064-mv2-796b5c8f16.png"],
  ["The New York Times", "/media/home/1a6711-45817a35423d42ff9c60ca96a97cae9f-mv2-7ea00b3108.png"],
  ["CP24", "/media/home/1a6711-fc4960e68c144dcf956fa98c6545da21-mv2-cdf68ad5a2.png"],
  ["Daily Mail", "/media/home/1a6711-083494d25ebf450595667bf403d3caeb-mv2-ab07d53240.png"],
  ["Brides", "/media/home/1a6711-d8183d1b12a0443c9f0ce1bc243d52fe-mv2-d1a9ae305a.png"],
  ["Toronto Star", "/media/home/1a6711-e4c2c59ce01040cf97f49f350a5a1cfc-mv2-680589cea8.png"],
  ["New You", "/media/home/1a6711-c0467b34fed34c31adcf4f66198496b6-mv2-4d0707852e.png"],
  ["The Knot", "/media/home/1a6711-f4dfa7ec58eb49629754fa11d39d9a07-mv2-77c4405401.png"],
  ["Narcity", "/media/home/1a6711-c84be58764e8430aad46fb1e72c16811-mv2-94dba6e8fb.png"],
  ["National Post", "/media/home/1a6711-d52d6adcb87f4716a4802558b4f876ae-mv2-45841bf31b.png"],
  ["Los Angeles Inquisitor", "/media/home/1a6711-d05f69ebe72e4f6e8b15f72e3cb4709e-mv2-7f62e21849.png"],
  ["Entertainment Tonight", "/media/home/1a6711-5a45dbfb7654419498394ff267394967-mv2-926f35064f.png"],
  ["Hollywood First Look", "/media/home/1a6711-d0f6a10f780346c498d6d48b16300813-mv2-b2e9bbae84.png"],
  ["Living Luxe", "/media/home/1a6711-7dbf6d86e52243198cf9e5a6f175a8e9-mv2-44d5af1bbc.png"],
  ["Cityline", "/media/home/1a6711-0503ed8705c943b9bc9a132fabf11eb2-mv2-c4f9862b67.png"],
  ["Millennium", "/media/home/1a6711-411460c39f5640cfa26230bd6ee648f9-mv2-a1534c924d.png"],
  ["Gurus", "/media/home/1a6711-17aeb03ab6f04682a30adbab96867e20-mv2-ba2126ebfb.png"],
] as const;

function LocalImage({ media, alt, priority = false }: { media: LocationMedia; alt: string; priority?: boolean }) {
  return <Image src={media.src} alt={alt} fill sizes="(max-width: 767px) 100vw, 50vw" priority={priority} loading={priority ? undefined : "eager"} unoptimized />;
}

function LegacyProposalPage({ page }: { page: LocationPageRecord }) {
  const pageImages = images(page);
  const hero = pageImages.find((media) => media.src.includes("5de2c551"));
  const champagne = pageImages.find((media) => media.src.includes("724f8d06"));
  const hands = pageImages.find((media) => media.src.includes("cd5f2ec2"));
  const intro = paragraphs(page)[0];
  const reviews = page.lines.filter((line) => line.startsWith('"Amber') || line.startsWith('"There'));
  const reviewImages = ["0c3ba215", "b56ed06b", "a196f1a8"].map((id) => pageImages.find((media) => media.src.includes(id))).filter((media): media is LocationMedia => Boolean(media));
  const packageItems = page.lines.slice(page.lines.findIndex((line) => line.includes("PROPOSAL") && line.includes("PACKAGE")) + 1).filter((line) => line.length > 20 && line.length < 130).slice(0, 5);
  const city = page.pathname.endsWith("california") ? "California" : "Toronto";
  return <main className={`location-page legacy-proposal-page legacy-${city.toLowerCase()}`}>
    <section className="legacy-proposal-hero">
      {hero ? <LocalImage media={hero} alt={`${city} proposal on a boat`} priority /> : null}
      <div><h1>THINKING OF POPPING THE<br />QUESTION?</h1><p>Let me arrange the details while you just focus on what<br />to say to that special someone!</p><Link href="/contact">Request Consultation⌄</Link></div>
    </section>
    <section className="legacy-proposal-intro">
      <div>{champagne ? <LocalImage media={champagne} alt="Proposal champagne setting" /> : null}</div>
      <p>{intro}</p>
      <div>{hands ? <LocalImage media={hands} alt="Newly engaged couple holding hands" /> : null}</div>
    </section>
    <section className="legacy-proposal-contact"><h2>Let&apos;s Start Planning</h2><span className="section-rule" /><div><p><strong>Call</strong><br />{city === "California" ? "(310) 750-4585" : "(647) 444-5599"}</p><p><strong>Email</strong><br />contact@amberwalkerevents.com</p></div></section>
    <section className="legacy-package" data-location-section="package"><div><Link href="/proposalweddingportfolio">CLICK HERE FOR GALLERY</Link></div><div><h2>PROPOSAL PLANNING PACKAGE</h2>{packageItems.map((item) => <p key={item}>{item}</p>)}</div></section>
    <section className="legacy-reviews" data-location-section="reviews">{reviews.slice(0, 4).map((review, index) => <article key={review}>{reviewImages[index % reviewImages.length] ? <div><LocalImage media={reviewImages[index % reviewImages.length]} alt="Amber Walker Events proposal" /></div> : null}<blockquote>{review}<cite>{["ASH", "MICKEY", "RAGULAN", "DREW"][index]}</cite></blockquote></article>)}</section>
    <section className="legacy-consultation"><form><h2>Request A Free Consultation</h2><p>Let&apos;s work together to make it the perfect proposal</p><label>FULL NAME *<input name="name" autoComplete="name" /></label><label>PHONE *<input name="phone" type="tel" autoComplete="tel" /></label><label>EMAIL *<input name="email" type="email" autoComplete="email" /></label><label>EVENT DATE *<input name="eventDate" type="date" /></label><label>TELL US ABOUT YOUR PROPOSAL *<textarea name="message" rows={3} /></label><button type="submit">Send</button></form></section>
  </main>;
}

function PressGrid() {
  return <section className="location-press" data-location-section="press"><h2>AS SEEN ON</h2><div>{pressLogos.map(([alt, src]) => <span key={src}><Image src={src} alt={alt} fill sizes="140px" loading="eager" unoptimized /></span>)}</div></section>;
}

function CorporatePlanning({ images: cardImages }: { images: LocationMedia[] }) {
  return <section className="location-planning" data-location-section="planning"><h2>WHAT WE PLAN</h2><p>THOUGHTFUL PLANNING. IMPECCABLE EXECUTION. UNFORGETTABLE EXPERIENCES.</p><div>{planningLabels.map((label, index) => <article key={label}>{cardImages[index % cardImages.length] ? <LocalImage media={cardImages[index % cardImages.length]} alt="" /> : null}<span>{label}</span></article>)}</div></section>;
}

function ProposalPackage({ page, background }: { page: LocationPageRecord; background?: LocationMedia }) {
  const headingIndex = page.lines.findIndex((line) => line.includes("PROPOSAL PLANNING") && line.includes("PACKAGE"));
  const contactIndex = page.lines.findIndex((line) => line === "CONTACT US FOR A FREE CONSULTATION");
  const items = page.lines.slice(Math.max(0, headingIndex + 1), contactIndex > headingIndex ? contactIndex : undefined).filter((line) => line.replaceAll("​", "").trim());
  return <section className="proposal-package" data-location-section="package">
    {background ? <LocalImage media={background} alt="Proposal planning setting" /> : null}
    <div><h2>PROPOSAL PLANNING PACKAGE</h2>{items.map((item) => <p key={item}>{item}</p>)}<Link href="/contact">CONTACT US FOR A FREE CONSULTATION</Link></div>
  </section>;
}

export function LocationPage({ page }: { page: LocationPageRecord }) {
  if (page.pathname === "/proposalplanningcalifornia" || page.pathname === "/proposalplanningtoronto") return <LegacyProposalPage page={page} />;
  const pageImages = images(page);
  const video = videos(page)[0];
  const hero = pageImages.find((media) => /f000|poster/i.test(media.source)) || pageImages.find((media) => /\.jpe?g$/i.test(media.src)) || pageImages[0];
  const introCopy = page.family === "proposal" ? page.lines.slice(1, 3) : page.family === "corporate" ? page.lines.slice(2, 5) : [page.lines[1], page.lines[3], page.lines[5]];
  const weddingCopy = [page.lines[7], page.lines[9], page.lines[11], page.lines[13], page.lines[15], page.lines[17], page.lines[19]].filter(Boolean);
  const features = pageImages.filter((media) => /\.jpe?g$/i.test(media.src) && media.src !== hero?.src).slice(0, 16);
  const corporateCards = selectMedia(pageImages, corporateCardTokens);
  const weddingFeature = pageImages.find((media) => media.src.includes("e06b1aee"));
  const proposalMedia = proposalMediaByRoute[page.pathname];
  const proposalBackground = proposalMedia ? pageImages.find((media) => media.src.includes(proposalMedia.background)) : undefined;
  const gallery = selectMedia(pageImages, page.family === "corporate" ? corporateGalleryTokens : page.family === "wedding" ? weddingGalleryTokens : proposalMedia?.gallery || []);
  return <main className={`location-page location-${page.family}`}>
    <section className="location-hero">
      <div className="location-hero-media">{video ? <video src={video.src} poster={hero?.src} autoPlay muted loop playsInline /> : hero ? <LocalImage media={hero} alt="" priority /> : null}</div>
      <div className="location-hero-shade" />
      <div className="location-hero-copy"><h1>{page.heroTitle}</h1><a href={page.cta}>Let&apos;s Discuss Your Event</a></div>
    </section>
    <section className="location-intro">{introCopy.filter(Boolean).map((text) => <p key={text}>{text}</p>)}</section>
    {page.family === "wedding" ? <section className="location-feature" data-location-section="planning"><div><h2>WHERE LOVE MEETS LUXURY</h2>{weddingCopy.map((text) => <p key={text}>{text}</p>)}</div>{weddingFeature ? <div className="location-feature-image"><LocalImage media={weddingFeature} alt={`${page.heroTitle} celebration`} /></div> : null}</section> : null}
    {page.family === "corporate" ? <><PressGrid /><CorporatePlanning images={corporateCards.length === planningLabels.length ? corporateCards : features} /></> : null}
    {page.family === "proposal" ? <><PressGrid /><ProposalPackage page={page} background={proposalBackground || features[0]} /></> : null}
    {page.family === "wedding" ? <PressGrid /> : null}
    {gallery.length ? <section className="location-gallery" data-family={page.family} data-location-section="gallery">{gallery.map((media, index) => <div key={media.src}><LocalImage media={media} alt={`${page.heroTitle} example ${index + 1}`} /></div>)}</section> : null}
    {page.family === "corporate" ? <section className="location-cta"><h2>LET&apos;S CREATE SOMETHING UNFORGETTABLE</h2><a href={page.cta}>SCHEDULE NOW</a><Link href="/corporatesocialportfolio">VIEW THE PORTFOLIO</Link></section> : null}
  </main>;
}
