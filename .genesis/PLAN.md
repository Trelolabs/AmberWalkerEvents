# Amber Walker Events — Implementation Plan

Status: planning complete; implementation awaits approval.

## Scope baseline

- Reference: `https://www.amberwalkerevents.com/`
- Framework: Next.js App Router + TypeScript
- Route baseline discovered on 2026-09-26: 81 static pages and 13 blog articles
- Fidelity target: content, imagery, typography, color, spacing, responsive layouts, navigation, galleries, video presentation, forms, metadata, and public URLs
- Asset rule: download the highest useful original Wix media once, give it a descriptive filename, store it locally under `public/media`, and never hotlink production media
- Assumption: the client has permission to reproduce the site's copy, branding, photos, and videos

## Architecture decision

Use reusable page families rather than 94 unrelated page components:

1. Shared site shell: desktop/mobile header, menus, footer, buttons, typography, metadata.
2. Core editorial pages: home, about, Amber bio, media, contact, proposal tips.
3. Service landing pages: corporate, wedding, proposal, and social events.
4. Location pages driven by typed content data: 21 corporate, 21 wedding, 23 proposal.
5. Portfolio/video pages with reusable gallery and video components.
6. Blog index and 13 data-driven articles.

All visible assets will be indexed in `src/content/media-manifest.ts` and stored as:

```text
public/media/
  brand/
  home/
  about/
  services/{corporate,weddings,proposals,social}/
  locations/{city}/
  portfolio/{corporate-social,proposal-wedding}/
  blog/{slug}/
  press/
  video/
```

## M0 — Capture a reproducible reference baseline

Outcome: a crawler-generated inventory of every route, source asset URL, local asset target, page title, metadata, text block, link, and desktop/mobile reference screenshot.

Work:

- Add a Playwright-based audit/capture script with bounded concurrency and retry logging.
- Preserve the 94 public paths exactly, including existing spelling variants such as `/newyorkpropsalplanning`.
- Capture reference screenshots at 1440×1100 and 390×844, plus full-page images for visual comparison.
- Resolve Wix transforms to the clearest available source image/video; retain aspect ratio and record attribution/source URL in a manifest.
- Deduplicate assets by content hash and use descriptive, stable filenames.
- Record unavailable, externally embedded, or rights-restricted media rather than silently substituting it.

Demo command:

```bash
pnpm audit:source && pnpm audit:source:check
```

Freeze boundary: route list, copy snapshot, asset manifest schema, and reference screenshots become the immutable comparison baseline.

Assigned skills: Genesis workflow; repository/browser tooling. No image generation is used for source-owned assets.

## M1 — Establish the Next.js foundation and shared shell

Outcome: a runnable responsive app with the matching global header, navigation, footer, fonts, tokens, error states, and route data model.

Work:

- Create a current stable Next.js App Router project with TypeScript, ESLint, and Playwright.
- Implement local fonts after identifying the exact families and licensed webfont files from the source.
- Create black, white, and lilac theme variants used by the reference page families.
- Reproduce desktop dropdown menus and the observed mobile navigation behavior accessibly.
- Configure `next/image`, local media, sitemap, robots, canonical metadata, and not-found behavior.

Demo command:

```bash
pnpm lint && pnpm typecheck && pnpm test:e2e --grep "shared shell"
```

Freeze boundary: package manager, application structure, design tokens, global shell APIs, breakpoints, and content schemas.

Assigned skills: Genesis BUILD/VERIFY loop; `design-taste-frontend` only as an implementation-quality guard, never to redesign the reference.

## M2 — Reproduce the core and service landing pages

Outcome: pixel-faithful implementations of the home page and the 15 non-location static pages.

Routes:

```text
/
/meetamber
/aboutawe
/corporatesocialportfolio
/corporatesocialvideos
/proposalweddingportfolio
/proposalweddingvideos
/socialevents
/copy-of-social-events
/corporateevents
/proposalplanning
/weddingplanning
/proposaltips
/media
/contact
/blog
```

Work:

- Match hero media, content order, galleries, logo/press grids, testimonials, CTA states, and footer variants.
- Implement gallery/lightbox, video playback/embed behavior, external links, and contact form UX.
- Preserve content and visible quirks where they are part of the current site, while meeting keyboard and reduced-motion requirements.

Demo command:

```bash
pnpm test:e2e --grep "core pages" && pnpm visual:test --project=core
```

Freeze boundary: shared editorial, gallery, press, video, CTA, and contact components.

Assigned skills: Genesis BUILD/VERIFY loop; visual screenshot comparison.

## M3 — Reproduce all 65 location/service pages

Outcome: every corporate, wedding, and proposal location URL renders its exact source copy, media, metadata, theme, and responsive composition.

Work:

- Use typed page content records and three reusable templates with per-route exceptions supported explicitly.
- Keep the live slugs unchanged; do not “correct” aliases or typos.
- Verify page titles/H1s, city-specific sections, hero video/image, CTA target, internal links, and footer.

Demo command:

```bash
pnpm test:e2e --grep "all location routes" && pnpm visual:test --project=locations
```

Freeze boundary: all 65 location content records and template exception rules.

Assigned skills: Genesis BUILD/VERIFY loop; visual screenshot comparison.

## M4 — Reproduce the blog and rich-media behavior

Outcome: the blog index, all 13 articles, portfolio galleries, and video pages behave like the reference without production hotlinks for owned media.

Work:

- Store blog content as typed local data or MDX according to its complexity.
- Match cards, article typography, image placement, share/external links, and related-navigation behavior.
- Use poster frames, lazy loading, and accessible controls for videos; preserve third-party embeds where local capture is inappropriate.

Demo command:

```bash
pnpm test:e2e --grep "blog|gallery|video" && pnpm visual:test --project=rich-media
```

Freeze boundary: blog schema, article content, gallery ordering, video sources, and embed policy.

Assigned skills: Genesis BUILD/VERIFY loop.

## M5 — SEO, forms, performance, and accessibility

Outcome: the clone is production-ready, not only visually similar.

Work:

- Match per-route title, description, canonical, Open Graph data, structured data, sitemap, and robots rules.
- Connect the contact form only after the deployment target/email destination is supplied; until then use a validated adapter with a safe test implementation.
- Add image sizing, responsive `srcset`, priority loading, caching, font preload, and video poster optimization.
- Run keyboard, focus, alt text, reduced-motion, broken-link, and contrast checks.

Demo command:

```bash
pnpm verify:quality
```

Freeze boundary: metadata map, form contract, analytics boundary, and performance budgets.

Assigned skills: Genesis VERIFY loop.

## M6 — Independent full-site fidelity verification

Outcome: all 94 routes pass functional checks and approved desktop/mobile visual comparisons.

Acceptance thresholds:

- Every sitemap route returns 200 and contains its expected H1/title.
- No missing local media or unexpected production Wix media requests.
- Navigation, dropdowns, CTAs, lightboxes, videos, and form validation work at both target viewports.
- Screenshot differences are reviewed route-by-route; global pixel threshold is ≤1.5% after masking intentional dynamic media frames.
- No critical accessibility violations, TypeScript errors, lint errors, or broken internal links.
- Production build succeeds from a clean install.

Demo command:

```bash
pnpm verify:all
```

Freeze boundary: approval snapshot and release candidate.

Assigned skills: separate verifier context per Genesis requirements.

## Approval gate

Implementation starts with M0 only after the user approves this plan. Each milestone exits through verification before the next begins. Material scope changes update this plan before code changes.
