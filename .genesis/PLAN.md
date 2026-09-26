# Amber Walker Events — Fidelity Recovery Plan

Status: approved on 2026-09-26; R0 complete and R1 ready.

## Objective

Finish the 94-route Next.js clone by replacing smoke-level completeness with verified source fidelity. Preserve the existing route/media capture and Next.js foundation, but do not treat a route as complete merely because it renders.

## Non-negotiable acceptance rules

- All comparisons use full-page screenshots at 1440px desktop and 390px mobile.
- The normal per-route visual-difference target is <= 1.5%; documented dynamic video frames may use reviewed masks.
- A section passes only when its content, asset order, layout, spacing, links, responsive state, and interaction are verified.
- The homepage is the only route that should contain the Good Company section, per the user's explicit product requirement.
- No placeholder content, empty visual spacer elements, broken local media, or production Wix hotlinks may remain.
- Every implementation milestone must pass lint, typecheck, a production build, functional tests, and its visual project before moving forward.

## Completed foundations retained

- M0 source inventory: 94 content records, desktop/mobile references, and local media capture.
- M1 application foundation: Next.js App Router, generated route metadata, shared shell, local media, and static route generation.

These foundations may be corrected where the audit proves them inaccurate; they are not evidence that later page work is complete.

## R0 — Repair the verification harness (complete)

Outcome: tests can detect missing below-the-fold sections, non-moving carousels, placeholders, broken links/media, and real mobile regressions.

Work:

- Make every visual project capture the full page at 1440px and 390px.
- Replace the default 55% smoke threshold with milestone-specific <= 1.5% gates.
- Add reviewed masks only for genuinely dynamic video frames and third-party widgets.
- Add assertions for carousel visibility, movement, seamless looping, reduced-motion fallback, and mobile swipe behavior.
- Add content-block, media-count, internal-link, overflow, and placeholder checks across all 94 routes.
- Produce a route-level report that names the failed section instead of reporting only one page-wide percentage.

Demo command:

```bash
pnpm verify:harness
```

Freeze boundary: reference dimensions, dynamic masks, route families, and fidelity thresholds.

## R1 — Finish the shared shell and homepage

Outcome: `/` matches the source composition and all shared shell elements are complete.

Work:

- Implement the original homepage hero slideshow, counters, timing, transitions, and reduced-motion fallback.
- Rebuild Good Company as a reliable client-logo carousel plus the complete testimonial presentation.
- Match source typography, spacing, press-logo ordering, service cards, and footer proportions.
- Add the missing Become a Vendor and Event Inquiry footer paths and verify every shared link.
- Keep Good Company exclusive to `/` as requested.

Demo command:

```bash
pnpm test:e2e --grep "homepage|shared shell|carousel" && pnpm visual:test --project=home
```

Freeze boundary: header, navigation, footer, typography tokens, carousel primitives, and homepage sections.

## R2 — Rebuild the service and editorial pages

Outcome: the four main service pages and supporting editorial pages no longer use generic approximations.

Routes:

```text
/corporateevents
/socialevents
/weddingplanning
/proposalplanning
/proposaltips
/copy-of-social-events
/meetamber
/aboutawe
/contact
```

Work:

- Implement each source-specific content order, press area, planning/package section, CTA, testimonial, and media arrangement.
- Restore the proposal-location selector and gallery/video links.
- Remove empty legacy placeholders and fixed spacing hacks.
- Correct contact addresses and implement complete client-side validation with a safe, non-production submit adapter.

Demo command:

```bash
pnpm test:e2e --grep "service and editorial pages" && pnpm visual:test --project=services
```

Freeze boundary: service-family, about, proposal-tip, legacy-social, and contact components.

## R3 — Correct all 65 location routes

Outcome: every corporate, wedding, and proposal location page uses the correct route-specific content, assets, composition, CTAs, and responsive behavior.

Work:

- Correct 21 corporate routes, then 21 wedding routes, then 23 proposal routes.
- Preserve shared components only where the original truly shares a section.
- Match source media order and crop per route instead of selecting assets by array position.
- Restore family-specific calls to action and gallery/video paths.
- Remove the artificial 420px proposal-gallery gap and audit every route for accidental whitespace.
- Handle the two legacy proposal variants explicitly.

Demo command:

```bash
pnpm test:e2e --grep "all location routes" && pnpm visual:test --project=locations
```

Freeze boundary: 65 location records, template variants, and route-specific exceptions.

## R4 — Complete portfolios, video, and media pages

Outcome: all five rich-media destinations match their source inventory and interactions.

Routes:

```text
/corporatesocialportfolio
/proposalweddingportfolio
/corporatesocialvideos
/proposalweddingvideos
/media
```

Work:

- Restore the complete ordered image/video inventory.
- Implement source-matching gallery proportions, lightbox behavior, keyboard navigation, video posters, and playback controls.
- Match the Media page's press/editorial layout and proposal-specific footer wording where required.

Demo command:

```bash
pnpm test:e2e --grep "portfolio|video|media" && pnpm visual:test --project=rich-media
```

Freeze boundary: gallery, lightbox, video-player, poster, and media-page APIs.

## R5 — Complete the blog index and 13 articles

Outcome: no blog route uses `milestone-placeholder`; every article contains its source copy, ordered media, category/location labels, and previous/next navigation.

Work:

- Add typed local article records or MDX for all 13 articles.
- Restore index filters for subject and location.
- Implement article typography, media flow, back/previous/next navigation, and responsive layouts.

Demo command:

```bash
pnpm test:e2e --grep "blog index|all blog articles" && pnpm visual:test --project=blog
```

Freeze boundary: blog schema, filters, article navigation, and all article content.

## R6 — Finish SEO, accessibility, forms, and performance

Outcome: the clone is production-ready beyond visual matching.

Work:

- Add sitemap, robots, route-specific Open Graph images, Twitter metadata, and relevant Organization/LocalBusiness/Article structured data.
- Validate canonical URLs, heading hierarchy, meaningful alt text, keyboard focus, contrast, and reduced motion.
- Run broken-link/media checks and confirm there are no unexpected source-domain requests.
- Optimize image sizes, responsive loading, fonts, video posters, caching, and Core Web Vitals.
- Connect a live form destination only after the user supplies and approves it.

Demo command:

```bash
pnpm verify:quality
```

Freeze boundary: metadata, structured data, form contract, accessibility baseline, and performance budgets.

## R7 — Independent release verification

Outcome: all 94 routes satisfy the binary definition of done and are ready for handoff.

Demo command:

```bash
pnpm verify:all
```

Required evidence:

- Clean install, lint, typecheck, production build, and all functional suites pass.
- Every route returns 200 with expected title, H1, content blocks, and local media.
- Every desktop/mobile screenshot passes the approved fidelity gate.
- A verifier separate from the implementation context records the final result.

Freeze boundary: approved reference snapshots and release candidate.

## Execution order

`R0 -> R1 -> R2 -> R3 -> R4 -> R5 -> R6 -> R7`

No later milestone starts while an earlier milestone has unresolved fidelity failures.
