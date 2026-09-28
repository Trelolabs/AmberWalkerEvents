"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CoreMedia } from "@/src/content/core-pages.generated";

type GalleryProps = {
  heading: string;
  images: readonly CoreMedia[];
  proposal: boolean;
};

export function PortfolioGallery({ heading, images, proposal }: GalleryProps) {
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (active === null) {
      if (dialog?.open) dialog.close();
      return;
    }
    if (dialog && !dialog.open) dialog.showModal();
  }, [active]);

  function close() {
    setActive(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function move(step: number) {
    setActive((current) => current === null ? 0 : (current + step + images.length) % images.length);
  }

  return <main className={`gallery-page${proposal ? " proposal-gallery-page" : " event-gallery-page"}`}>
    <h1>{heading}</h1>
    <section className="gallery-grid" aria-label={heading}>
      {images.map((media, index) => <button
        type="button"
        key={media.src}
        aria-label={`Open ${heading.toLowerCase()} image ${index + 1}`}
        onClick={(event) => {
          triggerRef.current = event.currentTarget;
          setActive(index);
        }}
      ><Image src={media.src} alt="" fill sizes="(max-width: 767px) 50vw, 20vw" /></button>)}
    </section>
    <dialog
      ref={dialogRef}
      className="portfolio-lightbox"
      aria-label={`${heading} image viewer`}
      onClose={() => setActive(null)}
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      }}
    >
      {active !== null ? <div className="portfolio-lightbox-frame">
        <Image src={images[active].src} alt={`${heading} image ${active + 1} of ${images.length}`} fill sizes="90vw" priority />
        <button className="portfolio-lightbox-close" type="button" aria-label="Close image viewer" onClick={close}>×</button>
        <button className="portfolio-lightbox-previous" type="button" aria-label="Previous image" onClick={() => move(-1)}>‹</button>
        <button className="portfolio-lightbox-next" type="button" aria-label="Next image" onClick={() => move(1)}>›</button>
        <span>{active + 1} / {images.length}</span>
      </div> : null}
    </dialog>
  </main>;
}

export type VideoSlide = {
  title: string;
  poster: string;
  video: string;
};

export function VideoGallery({ heading, slides, proposal }: { heading: string; slides: readonly VideoSlide[]; proposal: boolean }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function select(index: number) {
    setActive((index + slides.length) % slides.length);
    setPlaying(false);
    setMenuOpen(false);
  }

  return <main className={`video-page${proposal ? " proposal-video-page" : " event-video-page"}`} onKeyDown={(event) => {
    if (event.key === "ArrowLeft") select(active - 1);
    if (event.key === "ArrowRight") select(active + 1);
  }}>
    <h1>{heading}</h1>
    <section className="video-carousel" aria-label={heading} aria-roledescription="carousel">
      <div className="video-stage">
        {playing ? <video src={slides[active].video} poster={slides[active].poster} controls autoPlay playsInline preload="metadata" aria-label={slides[active].title} /> : <>
          <Image src={slides[active].poster} alt={slides[active].title} fill sizes="(max-width: 767px) 100vw, 980px" priority />
          <span className="video-stage-shade" />
          <button className="video-play" type="button" onClick={() => setPlaying(true)}><span aria-hidden="true">▶</span>Play Video</button>
        </>}
      </div>
      <div className="video-carousel-controls">
        <button type="button" aria-label="Show video selection" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>☰</button>
      </div>
      {menuOpen ? <div className="video-carousel-menu">{slides.map((slide, index) => <button type="button" key={slide.poster} aria-current={active === index} onClick={() => select(index)}>
        <Image src={slide.poster} alt="" fill sizes="240px" />
        <span>{slide.title}</span>
      </button>)}</div> : null}
    </section>
  </main>;
}

export function MediaFeature({ logos }: { logos: readonly (readonly [string, string])[] }) {
  return <main className="media-page">
    <h1>MEDIA</h1>
    <a className="media-video" href="https://www.youtube.com/watch?v=HgUBDIkKF70" target="_blank" rel="noreferrer" aria-label="Play Amber Walker Events on Cityline">
      <Image src="/media/video/media-cityline-poster.jpg" alt="Amber Walker on Cityline" fill sizes="710px" priority />
      <span aria-hidden="true">▶</span>
    </a>
    <section className="media-press" aria-labelledby="media-press-title">
      <h2 id="media-press-title">AS SEEN ON</h2>
      <div>{logos.map(([alt, src]) => <span key={src}><Image src={src} alt={alt} fill sizes="100px" /></span>)}</div>
    </section>
  </main>;
}
