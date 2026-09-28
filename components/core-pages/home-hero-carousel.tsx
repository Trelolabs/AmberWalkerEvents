import Image from "next/image";

const slides = [
  ["/media/home/display/hero-1.avif", "Floral event bar designed by Amber Walker Events"],
  ["/media/home/1a6711-2cef75767f11497fb46ee71a75204096-mv2-b9f3659784.png", "Elegant event setting designed by Amber Walker Events"],
  ["/media/home/1a6711-336fdd91af8e43cdb9b13b53d5148482-mv2-da50a21f4d.png", "Large-scale event designed by Amber Walker Events"],
] as const;

export function HomeHeroCarousel() {
  return <section className="home-hero" aria-label="Featured Amber Walker Events celebrations">
    {slides.map(([src, alt], index) => <div className="home-hero-slide" key={src} style={{ "--slide-index": index } as React.CSSProperties}>
      <Image src={src} alt={alt} fill sizes="100vw" priority={index === 0} />
    </div>)}
    <div className="home-hero-counter" aria-hidden="true">
      {slides.map(([, alt], index) => <span key={alt} style={{ "--slide-index": index } as React.CSSProperties}>{index + 1}/{slides.length}</span>)}
    </div>
  </section>;
}
