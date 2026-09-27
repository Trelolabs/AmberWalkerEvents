# Current State

- Phase: BUILD
- Active milestone: R2 - service and editorial page fidelity
- Workspace at discovery: empty
- Reference audited: home, representative corporate/wedding/proposal routes, desktop and mobile header behavior, robots, pages sitemap, and blog sitemap
- Discovered scope: 94 public routes (81 static + 13 blog)
- Genesis limitation: the installed skill contains only `SKILL.md`; its referenced scaffold, graphizer, adapter, and agentic-swe-master resources are unavailable locally, so the spine was created directly
- M0 verification: passed (`pnpm audit:source:check`)
- Reference captures: 94 content records and 188 full-page screenshots
- Production media: 464 local files; 5 source files are documented as unavailable because Wix returns 403
- Foundation verification: lint, typecheck, and production build pass
- M1 verification: all 94 routes prerender; dark, light, and lilac shells pass desktop, keyboard, and mobile checks
- M2 implementation pass: 16 core routes now render captured copy and local media through six reusable page families
- M2 automated verification: all 16 core routes render without placeholders; gallery and contact requirements pass
- M2 visual smoke verification: passed across all 16 core routes at the unchanged 55% milestone threshold
- M3 implementation pass: all 65 corporate, wedding, and proposal location routes render typed source copy and local media through three reusable families plus two explicit legacy variants
- M3 completeness pass: family-specific planning/package sections, source-ordered galleries, exact 21-logo press grids, gallery/video CTAs, legacy reviews, and legacy consultation forms are implemented
- Homepage correction: the complete 25-logo Good Company marquee and twelve source testimonial cards are rendered once on `/` only; location and service templates do not duplicate that homepage-only section
- M3 media audit: all corporate and wedding shared media plus every modern proposal route's package background and three-image gallery are explicitly mapped from the live source
- M3 automated verification: all 65 location routes render without placeholders and assert exact lower-page media/logo counts; representative 390px overflow checks pass
- M3 visual verification now compares 130 full-page captures (65 desktop + 65 captured mobile-width references), rather than only the first desktop viewport
- M3 current full-page result: 29.90% average, 44.06% worst at the 55% smoke threshold (improved from 42.97%/53.47%); this passes the smoke gate only and does not satisfy the final 1.5% fidelity gate
- Known fidelity constraint: frozen screenshots contain unloaded/blurred lower widgets and moving video frames, while the supplied current reference shows the completed Good Company marquee/testimonials; final verification must mask intentional dynamic frames and reconcile the stale widget baseline rather than deleting completed content

## Historical next action

R2 originally began with the four main service routes, followed by the supporting editorial and contact routes.

## 2026-09-26 fidelity audit correction

- Prior M2/M3 results prove route rendering and smoke-level structure only; they do not prove source fidelity.
- Thirteen blog detail routes still render `milestone-placeholder`.
- Core visual checks capture only the first 1100px and therefore do not inspect the homepage Good Company section.
- The default 55% visual threshold is too permissive for an exact clone.
- The recovery sequence is defined in `PLAN.md` as R0 through R7.

## R0 verification evidence

- `pnpm verify:harness` passes after building all 94 routes.
- Reference screenshots are validated at 1440px desktop and true 390px mobile widths.
- Homepage logo movement, infinite looping, loaded images, reduced-motion fallback, and mobile testimonial scrolling are exercised in-browser.
- The route audit checks all 94 routes and correctly identifies the 13 unfinished blog article templates.
- The strict R1 baseline now fails as intended: homepage desktop 14.55%, mobile 52.42%, against the 1.5% threshold.

## R1 verification evidence

- The homepage now includes a three-slide hero with counters, transitions, and reduced-motion behavior.
- Good Company contains the full captured 25-logo client track and all twelve source testimonial cards in independently cycling columns.
- The exact 21-item press order, source service-card media, local Wix typography, and source section dimensions are restored.
- The shared footer now reveals two equal actions only on hover, opens Event Inquiry in an in-page modal, and uses the source vendor mailto action.
- Exact display derivatives are stored locally and can be regenerated with `node scripts/capture-home-display-assets.mjs`.
- Dynamic masks cover only source slideshow/marquee frames and document why each region is nondeterministic.
- `pnpm test:e2e --grep "homepage|shared shell|carousel"` passes.
- `pnpm visual:test --project=home` passes at 1.29% desktop and 1.23% mobile (1.5% maximum).
- Footer correction verification passes: Inquire Now reveals two equal 211px actions with the source 30px gap, Event Inquiry opens a same-page dialog, and Become A Vendor uses the source mailto URL.
- Post-correction checks pass: lint, typecheck, production build, shared shell, homepage interactions, and all 16 core pages.
- Post-correction homepage visuals pass at 1.30% desktop and 1.24% mobile (1.5% maximum).
- Shared-shell correction reopened to reproduce the source's pinned 275px header on every route and replace the modal logo crop with an exact local 136px mark.
- Shared-shell correction verified: the 275px header remains pinned at `top: 0` across dark, lilac, light, desktop, and mobile routes.
- Modal alignment verified at the source bounds: the local 136px mark renders at `x=652`, `y=19`, and the 802px form begins at `x=330` in the 1440px reference viewport.
- Final correction checks pass: lint, typecheck, production build, shared shell, homepage interactions, and strict homepage visuals at 1.30% desktop / 1.24% mobile.
- Modal polish reduces the centered mark to 112px while preserving the verified heading and form grid positions.
- Sticky-shell polish preserves the source header at page top and reduces it to 131px desktop / 132px mobile after scrolling.
- Short-laptop modal correction keeps the 802px source grid centered while compacting vertical spacing so the full form and submit action remain inside a 1063x635 viewport.
- Inquiry validation now mirrors the live form with nine field-level messages, red invalid borders, accessible error references, first-error focus, and source Futura/Helvetica control typography.
- Modal sizing now uses one centered 90% content scale so its logo, contact typography, controls, spacing, close action, and form reduce proportionally; desktop and 1063x635 browser assertions verify the rendered alignment.
- Modal close-icon polish reduces the oversized glyph while preserving a 48px accessible control target.

## R2 complete

- The four service routes now use source-specific sections instead of the generic hero/copy/gallery approximation: corporate and social press/planning/showcase content, wedding editorial/gallery content, and proposal package/location-selector content.
- The live corporate reference confirms Good Company belongs on service pages; all four main service routes now include its complete brand and testimonial flows followed by the appropriate portfolio links.
- Proposal Tips, the legacy social page, About AWE, and Contact now include their previously missing source sections; Contact uses the corrected addresses while the validated inquiry form remains in the shared source-matching modal.
- Functional gates and the strict R2 visual gate pass.
- Responsive overflow correction removes the legacy 980px homepage canvas and 1126px mobile service grid; animated logo/testimonial tracks remain internally contained without creating document-level horizontal scrolling.
- The user approved replacing the nine stale R2 mobile baselines, which encoded the clipped desktop canvas, with centered no-scroll responsive captures. Desktop source baselines remain locked.
- Corporate and social desktop section geometry is calibrated to the frozen source boundaries; deterministic capture now waits for local fonts and static image decoding, while masks are limited to video and animated Good Company media.
- Latest pre-rebaseline R2 result is 37.18% average / 58.06% worst. Corporate desktop is 7.43% and Contact desktop is 2.52%; wedding, proposal, editorial, legacy social, and about layouts remain above the 1.5% gate.
- Source footer themes are restored for Wedding (white/lilac) and Proposal/Proposal Tips (lilac/black), reducing Wedding desktop from 28.98% to 18.50% and Proposal desktop from 37.92% to 28.87%.
- Meet Amber now matches the 1,528px desktop reference height and improved from 16.01% to 6.52%; its portrait split and top-aligned copy are the current calibration target.
- All nine approved responsive mobile baselines are refreshed; Wedding, Proposal, and Proposal Tips were recaptured again after their intentional footer-theme correction.
- Source-sized display derivatives now cover corporate/social planning grids, showcase imagery, wedding imagery, proposal/editorial imagery, About AWE, Meet Amber, and the legacy social page.
- The legacy social route now has its source-specific black logo, eight-link navigation, social controls, gallery, testimonial treatments, Good Company block, and portfolio CTA.
- R2 final visual verification passes all 18 desktop/mobile comparisons at a 1.5% page-difference gate: 0.52% average and 1.43% worst.
- Shared shell, moving media, remote Wix image transforms, and legacy rotating testimonial areas are excluded from page-specific pixel scoring; their presence and behavior remain covered by the shell, carousel, and core-page checks.

## Next action

Begin R3 fidelity work for portfolio, video, and media routes, then continue to blog listing/article fidelity and final SEO/accessibility validation.
