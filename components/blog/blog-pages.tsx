"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { blogArticles } from "@/src/content/blog.generated";
import type { BlogArticle, BlogMedia } from "@/src/content/blog.generated";

const subjects = ["Corporate", "Lifestyle", "Proposal", "Social"];
const locations = ["Chicago", "Los Angeles", "Miami", "Texas", "Toronto", "Worldwide"];

function ArticleMedia({ media, title, priority = false }: { media: BlogMedia; title: string; priority?: boolean }) {
  const style = { "--blog-media-ratio": media.aspect } as CSSProperties;
  if (media.kind === "missing") return <div className="blog-media blog-media-missing" style={style} aria-label="Source media unavailable" />;
  if (media.kind === "video") return <div className="blog-media blog-video" style={style}><video src={media.src} autoPlay muted loop playsInline preload="metadata" aria-label={`${title} video`} /></div>;
  return <div className="blog-media" style={style}><Image src={media.src} alt={title} fill sizes="(max-width: 767px) 100vw, 50vw" priority={priority} /></div>;
}

export function BlogIndex() {
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const articles = useMemo(() => blogArticles.filter((article) =>
    ((!subject || subject === "All") || article.subject.includes(subject.toUpperCase())) && ((!location || location === "All") || article.filterLocation === location)
  ), [subject, location]);

  return <main className="blog-page">
    <h1>BLOG</h1>
    <div className="blog-filters">
      <select aria-label="Filter Subject" value={subject} onChange={(event) => setSubject(event.target.value)}><option value="">Filter Subject</option><option>All</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select>
      <select aria-label="Select Location" value={location} onChange={(event) => setLocation(event.target.value)}><option value="">Select Location</option><option>All</option>{locations.map((item) => <option key={item}>{item}</option>)}</select>
    </div>
    <section className="blog-grid" aria-live="polite">
      {articles.map((article) => <article className="blog-card" key={article.slug}>
        <div className="blog-card-image"><Image src={article.image} alt="" fill sizes="246px" /></div>
        <div className="blog-card-copy"><h2>{article.indexTitle}</h2><p className="blog-card-subject">{article.indexSubject}</p><span>{article.indexLocation}</span><p className="blog-card-excerpt">{article.indexExcerpt}</p><Link href={`/blogs/${article.slug}`}>Read Story</Link></div>
      </article>)}
      {!articles.length ? <p className="blog-empty">No stories match those filters.</p> : null}
    </section>
  </main>;
}

export function BlogArticlePage({ article }: { article: BlogArticle }) {
  const index = blogArticles.findIndex((item) => item.slug === article.slug);
  const previous = blogArticles[(index - 1 + blogArticles.length) % blogArticles.length];
  const next = blogArticles[(index + 1) % blogArticles.length];
  const rowCount = Math.max(1, article.media.length - 1);
  const rows = article.sections.slice(0, rowCount);
  const closing = article.sections.slice(rowCount);

  return <main className="blog-article-page">
    <nav className="blog-article-nav" aria-label="Blog navigation">
      <Link href="/blog" className="blog-back"><span aria-hidden="true">←</span> BACK TO<br />BLOGS</Link>
      <div><Link href={`/blogs/${previous.slug}`}><span aria-hidden="true">←</span> PREVIOUS<br />BLOG</Link><Link href={`/blogs/${next.slug}`}>NEXT<br />BLOG <span aria-hidden="true">→</span></Link></div>
    </nav>
    <section className="blog-lead">
      <div className="blog-lead-copy"><h1>{article.title}</h1><p className="blog-labels">{article.subject}<br />{article.location}</p><p>{article.intro}</p></div>
      <ArticleMedia media={article.media[0]} title={article.title} priority />
    </section>
    <div className="blog-story" style={{ "--blog-top-gap": `${article.topGap}px` } as CSSProperties}>
      {rows.map((section, row) => <section className={`blog-story-row${row % 2 ? " reverse" : ""}`} key={`${article.slug}-${row}`}>
        <div className="blog-story-copy"><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <ArticleMedia media={article.media[row + 1]} title={`${article.title} — ${section.heading || `scene ${row + 2}`}`} />
      </section>)}
      {closing.length ? <section className="blog-story-closing">{closing.map((section) => <div key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>)}</section> : null}
    </div>
  </main>;
}
