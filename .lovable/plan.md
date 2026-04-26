# Active Plan

## Current objective
Finish the `bazari.site` production cutover without redesigning the app:
- frontend live on Vercel custom domains
- backend live on Render at `api.bazari.site`
- HTTPS login, payment methods, Cloudinary upload, and WhatsApp checkout all verified

## Current operating mode
- The user has now set the workflow to live-first.
- Prioritize production validation on `bazari.site` and `api.bazari.site`.
- Do not default back to localhost work unless production is blocked or the user asks for local verification.

## Current live state
- `https://www.bazari.site` returns `200` on Vercel
- `https://bazari.site` redirects to `https://www.bazari.site/`
- `https://api.bazari.site/api/health` returns `200`
- `https://api.bazari.site/api/payment-methods` returns `200` JSON
- `https://api.bazari.site/api/homepage` returns `200`
- `https://api.bazari.site/api/products?limit=10` currently returns `total = 3`
- `https://www.bazari.site/bazari-logo.jpg` returns `200`
- live `manifest.json` reports `short_name = "Bazari"`
- public payment payload was re-checked on 2026-04-25 and shows `whatsapp_phone = "994557252025"` and `whatsapp_configured = true`
- production admin payment payload was re-checked on 2026-04-25 and shows `whatsapp_phone = "994557252025"`, `whatsapp_configured = true`, `whatsapp_source = "database"`, and populated `whatsapp_updated_at`

## Already completed
- On 2026-04-26, local mock/fallback and product-speed cleanup was completed before deploy:
  - static mock catalog file `src/data/mockData.js` was removed
  - homepage category, hero, campaign, brand, footer category, and mobile category-sheet mock fallbacks were removed
  - the storefront now renders live API data only for products/categories/campaigns/brands
  - product cards and search results now pass product preview data and warm `src/lib/productPrefetch.js`
  - product detail now renders preview/cache data immediately, then fetches full product, reviews, and similar products in non-blocking stages
  - backend product/category/homepage/review routes received short cache headers
  - product list supports `count=false` for fast secondary lists
  - reviews GET now uses read-only aggregation and limits returned reviews instead of recomputing stats with a write on every read
  - `npm.cmd run build` passed
  - `node --check` passed for touched backend routes
  - commit `3d260c2` pushed to `main`
  - Vercel production deploy `dpl_AcwtcfKJZGvujF5q7G38jn8iso9D` completed and was aliased to `https://www.bazari.site`
  - Render picked up the backend push; live cache headers are visible on product/category/homepage endpoints
  - live smoke passed for `www.bazari.site`, apex redirect, API health, and public payment methods
  - public WhatsApp payment state still shows `whatsapp_phone = "994557252025"` and `whatsapp_configured = true`
  - live bundle check found no old mock strings (`Premium Wireless`, `Qadın geyimi`, `Ayaqqabı`, `Elektronikada Böyük`, `Populyar brendlər`)
  - live mobile CDP verification passed: first product card about `898ms`, product click detail route about `5ms`, product image/info about `7ms`, runtime exceptions `0`
  - one cold API request after idle took about `16s`, then warm API calls were around `150-260ms`; Render cold-start remains the next infrastructure-level speed limit
- On 2026-04-26, product detail image gallery controls were completed and deployed:
  - `src/pages/ProductDetail.jsx` now supports active image state per product
  - users can swipe/drag the main image to change photos
  - users can tap thumbnail buttons under the main image to change photos
  - previous/next controls and an image counter show when multiple images exist
  - `npm.cmd run build` passed
  - commit `9a582d8` pushed to `main`
  - Vercel production deploy `dpl_AdSDwSTUBfHPNKVAaFkZuvahZ1bR` completed and was aliased to `https://www.bazari.site`
  - live mobile CDP verification passed: thumbnail tap and swipe both changed the main image, active thumbnail state updated, runtime exceptions `0`, failed requests `0`
- On 2026-04-26, admin-editable homepage hero banners were implemented locally:
  - `hero_banners` MongoDB support was added with ordering, active state, per-banner duration seconds, CTA text, image, and action config
  - backend admin CRUD routes are under `/api/admin/hero-banners`
  - homepage `/api/homepage` now returns active `hero_banners`
  - empty databases get two starter banners seeded from existing product/category data so the admin can change them later
  - hero CTA actions support internal product/category paths, external URL redirects, coupon code copy, or no link
  - the homepage `HeroBanner` component now supports admin timing, dots, prev/next, swipe/drag, and CTA actions
  - the admin campaigns tab was converted to `Hero bannerlər` with image upload/URL, live preview, CTA/link/duration/order/active fields, and product/category quick target selection
  - verification passed: backend `node --check`, root `npm.cmd run build`, and temporary local API smoke with `homepage_hero_banners = 2` and `admin_hero_banners = 2`
  - commit `8785b3e` pushed to `main`
  - Vercel production deploy `dpl_C8CeKpJyhfuG64ZKJTbhkGXYBQVe` completed and was aliased to `https://www.bazari.site`
  - Render backend picked up the push; live homepage API now returns `hero_banners = 2`
  - live smoke passed for `www.bazari.site`, apex redirect, API health, public payment methods, and WhatsApp configuration
  - live mobile CDP verification passed: hero exists, 2 dots visible, CTA visible, dot click and swipe changed banners, runtime exceptions `0`, failed requests `0`
- The live storefront mismatch is now fixed on production:
  - `GET https://api.bazari.site/api/homepage` is live and returns `200`
  - homepage product sections no longer fall back to static showcase cards
  - dummy live product `dsvxdczv` was deleted
  - current live products total is `3`
  - current production frontend assets no longer include placeholder showcase product strings
- The storefront product visibility bug is now fixed locally:
  - homepage fallback problem was identified
  - backend now exposes `GET /api/homepage`
  - product listing order now prefers newest `_id` first
  - a temporary smoke product was created via admin auth and confirmed visible in both `/api/products` and `/api/homepage`, then deleted
- Local runtime was refreshed again on 2026-04-23:
  - backend remained available on `http://127.0.0.1:10000`
  - frontend dev server is currently running on `http://localhost:8082/`
  - `8080` and `8081` were already busy, so Vite auto-shifted to `8082`
- Vercel CLI is authenticated in this shell
- the repo is linked to the existing Vercel project `bazari-explorer`
- frontend production and development envs were synced for:
  - `VITE_BACKEND_URL`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- `vite.config.ts` now switches to Nitro on Vercel builds while keeping the old local/default build path intact
- direct Vercel production deploy succeeded and fixed the broken `www.bazari.site` domain
- plain local `npm run build` still passes
- the current worktree was committed as `bea0ab1` and pushed to `main`
- Render picked up the backend push and production auth/payment checks passed:
  - login
  - `/api/auth/me`
  - `/api/payment-methods`
  - `/api/admin/payment-methods`
  - payment method toggle + revert
- Production smoke was re-run on 2026-04-23 and still passes for:
  - `https://www.bazari.site`
  - `https://bazari.site` -> `https://www.bazari.site/`
  - `https://api.bazari.site/api/health`
  - `https://api.bazari.site/api/payment-methods`
- Cloudinary upload is now verified on production end-to-end:
  - live frontend server function returns a valid signed payload
  - a real Cloudinary upload succeeds
  - the uploaded URL can be saved through the admin product API and the temporary smoke product was deleted again
- On 2026-04-24 later in this thread, WhatsApp checkout phone management was moved into backend/admin state:
  - backend now reads `app_settings.whatsapp_order_phone` before env fallback
  - admin route `PUT /api/admin/payment-methods/whatsapp-phone` was added
  - the admin payments tab now includes WhatsApp save/reset controls
  - local isolated smoke verification passed for save -> public payload update -> reset
  - invalid short input returns `400`
- On 2026-04-24 after push approval, that feature was deployed live:
  - commit `8c2d80b` pushed to `main`
  - Vercel production deploy `dpl_2JAUHfGtAUE3c2z3zu7CQW4iYoNu` completed and was aliased to `www.bazari.site`
  - Render live admin payload now includes `whatsapp_source` and `whatsapp_updated_at`
  - safe live reset call to `PUT /api/admin/payment-methods/whatsapp-phone` passed with `whatsapp_source = "unset"`
  - production JS bundle now contains the WhatsApp admin input/button strings
- On 2026-04-24 after that, Bazari branding replacement work was completed locally:
  - `public/bazari-logo.jpg` added from the user-provided logo
  - shared UI mark component added in `src/components/layout/BrandMark.jsx`
  - visible `Modamall` wordmarks replaced with `Bazari`
  - metadata/SEO/PWA brand strings updated to `Bazari`
  - frontend `npm run build` passed
- On 2026-04-24 after that, the Bazari rebrand was deployed live:
  - commit `b6e879c` pushed to `main`
  - Vercel production deploy `dpl_MZoPDHSTcXEuH3j1qd6CBJtSviNn` completed and was aliased to `www.bazari.site`
  - live smoke confirmed `Bazari` in homepage/login HTML
  - `https://www.bazari.site/bazari-logo.jpg` returns `200`
  - live `manifest.json` now reports `short_name = "Bazari"`
- On 2026-04-25, phone-only add-to-cart error investigation started:
  - live mobile CDP smoke confirmed the logged-in cart API POST returns `200`
  - the same run exposed React hydration error `#418`
  - product card wrappers were fixed so buttons are no longer nested inside product links
  - `ProductCard` card cart button now uses shared `addToCart`
  - route mount gating was added in `src/routes/index.tsx` and `src/routes/$.tsx` so the browser-only app does not hydrate different markup than the server rendered
  - `npm.cmd run build` passed; `npm.cmd run lint` timed out after roughly 3 minutes
- On 2026-04-25, the phone add-to-cart fix was pushed and deployed:
  - commits `29372ca` and `4c0d721` pushed to `main`
  - Vercel production deploy `dpl_FtEekd3NNquhHv19zpKH5wBuhgFD` completed and was aliased to `www.bazari.site`
  - post-deploy mobile verification passed: no `Something went wrong`, hydration exceptions `0`, cart add API `200`
  - the admin test cart was cleared afterward and returned `count = 0`
- On 2026-04-25, the user shared an Android Chrome screenshot where the same error still appeared after add-to-cart:
  - Chrome Translate UI was visible and root HTML still used `lang="en"`
  - `src/routes/__root.tsx` was updated to `lang="az"`, `translate="no"`, `notranslate`, and `meta name="google" content="notranslate"`
  - `npm.cmd run build` passed
- On 2026-04-25, the translate hardening was pushed and deployed:
  - commit `6174d3f` pushed to `main`
  - Vercel production deploy `dpl_7XRmqCccNEj5QZk8g3y9WinkioLg` completed and was aliased to `www.bazari.site`
  - live HTML confirmed `lang="az"` and `notranslate`
  - post-deploy Android-like mobile verification passed: no `Something went wrong`, exception count `0`, cart add API `200`
  - the admin test cart was cleared afterward and returned `count = 0`
- On 2026-04-25, Azerbaijani text/font cleanup was completed locally:
  - visible `\u0259`-style text escapes were converted to real UTF-8 Azerbaijani letters across the frontend/admin/public text and relevant backend payment/admin messages
  - global marketplace typography was changed to one consistent `Noto Sans` stack for body and heading text so Azerbaijani glyphs do not fall back to a different-looking font
  - local scan found no remaining Azerbaijani `\uXXXX` escape or common mojibake pattern under `src`, `public`, or `backend/src`
  - `npm.cmd run build` passed
  - backend syntax checks passed for `backend/src/paymentMethods.js` and `backend/src/routes/admin.js`
  - `npm.cmd run lint` was attempted but timed out after roughly 3 minutes in this Windows shell
  - commit `5f51b73` pushed to `main`
  - Vercel production deploy `dpl_EAhYy2UWzJWzDbWN9AqY1yuoTKek` completed and was aliased to `www.bazari.site`
  - post-deploy live smoke passed: `www.bazari.site` `200`, API health `200`, live CSS includes `Noto Sans`, old `Outfit`/`Manrope` imports are gone, and public WhatsApp payment state remains configured
- On 2026-04-25, the mobile bottom nav `Kateqoriya` item was activated:
  - `src/components/layout/MobileBottomNav.jsx` now opens a mobile category bottom sheet instead of linking back to home
  - categories are loaded from live `/api/categories` with static fallback
  - category items route to `/category/:slug`
  - local `npm.cmd run build` passed
  - commit `cb46a75` pushed to `main`
  - Vercel production deploy `dpl_7HRUVEcG7gh9ihCC81Rz3Kr2foNr` completed and was aliased to `www.bazari.site`
  - live mobile CDP verification passed: category nav opened the sheet, 3 live category links were shown, runtime exceptions were `0`, and `Something went wrong` was absent
  - final live smoke passed for `www.bazari.site`, API health, and public WhatsApp payment configuration

## Open deployment tasks
1. Run a safe live cart checkout redirect smoke when checkout work resumes and confirm it targets `https://wa.me/994557252025?text=...` without placing a real order
2. Optionally update the PWA icon PNG files if the browser/install icon must also match the new Bazari mark
3. Complete Render CLI auth/workspace setup only if future Render deploy/env work needs it

## Constraints
- preserve the dirty worktree; do not reset it
- do not hardcode secrets into source files
- do not redesign the app while deployment work is ongoing
- keep payment method availability server-driven
- keep the WhatsApp checkout phone configurable from backend/admin state, not frontend constants

## Risks
- preserve the live DB-backed WhatsApp state; production now reports `whatsapp_configured = true`
- `src/routeTree.gen.ts` is generated and may keep changing
- Windows local `VERCEL=1 npm run build` ends with a Nitro symlink `EPERM`, but the remote Vercel build succeeds
- placeholder storefront phone text exists in the UI and must not be treated as the real WhatsApp order line
- Render CLI `v2.15.1` is available only in `%TEMP%\render-cli-2.15.1`; login/workspace setup is still incomplete

## References
- durable repo guidance: `AGENTS.md`
- full current-state handoff: `NEW_THREAD_HANDOFF.md`
