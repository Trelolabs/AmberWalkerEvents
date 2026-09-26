# Current State

- Phase: BUILD
- Active milestone: R1 - shared shell and homepage fidelity
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
- Homepage correction: the 14-logo Good Company marquee and three star-rated testimonials are rendered once on `/` only; location and service templates do not duplicate that homepage-only section
- M3 media audit: all corporate and wedding shared media plus every modern proposal route's package background and three-image gallery are explicitly mapped from the live source
- M3 automated verification: all 65 location routes render without placeholders and assert exact lower-page media/logo counts; representative 390px overflow checks pass
- M3 visual verification now compares 130 full-page captures (65 desktop + 65 captured mobile-width references), rather than only the first desktop viewport
- M3 current full-page result: 29.90% average, 44.06% worst at the 55% smoke threshold (improved from 42.97%/53.47%); this passes the smoke gate only and does not satisfy the final 1.5% fidelity gate
- Known fidelity constraint: frozen screenshots contain unloaded/blurred lower widgets and moving video frames, while the supplied current reference shows the completed Good Company marquee/testimonials; final verification must mask intentional dynamic frames and reconcile the stale widget baseline rather than deleting completed content

## Next action

Begin R1 by reproducing the source homepage hero slideshow, then correct the Good Company testimonial/carousel presentation and shared footer.

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
