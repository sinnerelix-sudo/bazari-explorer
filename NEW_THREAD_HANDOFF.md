# NEW_THREAD_HANDOFF.md

## Current objective
Keep the local cart/payment flow testable while finishing production deployment for `bazari.site`:
- frontend host for the TanStack Start app
- Render-hosted backend at `api.bazari.site`
- production Atlas and Cloudinary envs
- admin login, payment-method management, and WhatsApp checkout verified on HTTPS

## Current operating mode
- On 2026-04-23, the user explicitly switched the workflow away from localhost-first verification.
- From this point forward, default execution should be live-first:
  - prefer checking and validating directly on `https://www.bazari.site`
  - prefer checking backend behavior on `https://api.bazari.site`
  - use local dev only if production work is blocked or the user specifically asks for localhost again

## 2026-04-26 current local performance pass
- User reported that first mobile entry still showed mock/fallback products/categories/banners and that product detail navigation felt around 2 seconds.
- Local cleanup removed the static mock catalog source `src/data/mockData.js`.
- Removed static fallback rendering from homepage categories, hero banners, campaign banners, brand zone, footer category links, and mobile category sheet.
- The storefront now shows live API categories/products/campaigns/brands only; if live categories are empty/unavailable, the mobile sheet shows an empty state instead of fake categories.
- Product cards and search results now pass product preview data through React Router state and warm a small in-memory product cache via `src/lib/productPrefetch.js`.
- `src/pages/ProductDetail.jsx` now renders preview/cache data immediately and loads the full product, reviews, and similar products in non-blocking stages.
- Secondary product-list calls for similar products now use `count=false`.
- Backend route optimization was added:
  - product/category/homepage/review GET responses set short cache headers
  - product list route supports `count=false`
  - review GET uses read-only aggregation and returns the latest 20 reviews instead of recomputing/writing product stats during reads
- Local verification already passed:
  - `npm.cmd run build`
  - `node --check` for `backend/src/routes/products.js`, `reviews.js`, `categories.js`, and `homepage.js`
- Commit pushed to `main`: `3d260c2` - `Remove mock fallbacks and speed product pages`.
- Vercel production deploy completed and was aliased to `https://www.bazari.site`:
  - deployment id: `dpl_AcwtcfKJZGvujF5q7G38jn8iso9D`
  - deployment url: `https://bazari-explorer-2wuj52gju-metrekareup1-3268s-projects.vercel.app`
- Render picked up the backend push; live product/category/homepage responses now include the new cache headers.
- Live smoke after deploy passed:
  - `https://www.bazari.site` -> `200`
  - `https://bazari.site` -> `308` redirect to `https://www.bazari.site/`
  - `https://api.bazari.site/api/health` -> `200`
  - `https://api.bazari.site/api/payment-methods` -> `200`
  - public WhatsApp payload still has `whatsapp_phone = "994557252025"` and `whatsapp_configured = true`
- Live production JS bundle no longer contains the old mock strings `Premium Wireless`, `Qadın geyimi`, `Ayaqqabı`, `Elektronikada Böyük`, or `Populyar brendlər`.
- Live mobile CDP verification passed:
  - homepage load event about `1562ms`
  - first live product card about `898ms`
  - category sheet opened with 3 live categories: `Premium hesablar`, `SMM xidmətləri`, `Streaming paketləri`
  - fake category names were absent
  - product click opened detail route in about `5ms`
  - product image/info was visible in about `7ms`
  - runtime exception count `0`
  - `Something went wrong` absent
- Observed infrastructure limit: the first API request after idle took about `16s`, then warm API requests were around `150-260ms`; this is Render cold-start behavior and remains the next thing to solve if first-ever load must be consistently instant.

## 2026-04-25 live resume snapshot
- Production was re-checked again from this thread and matches the latest expected live state:
  - `https://www.bazari.site` -> `200`
  - `https://bazari.site` -> `308` redirect to `https://www.bazari.site/`
  - `https://api.bazari.site/api/health` -> `200`
  - `https://api.bazari.site/api/payment-methods` -> `200`
  - `https://api.bazari.site/api/homepage` -> `200`
  - `https://api.bazari.site/api/products?limit=10` -> `total = 3`
  - `https://www.bazari.site/bazari-logo.jpg` -> `200`
  - live `manifest.json` -> `short_name = "Bazari"`
- The live products feed still does not include the deleted dummy/test product; current production count remains `3`.
- Production admin auth was re-used to check the backend admin payment payload:
  - `GET https://api.bazari.site/api/admin/payment-methods` succeeded
  - `methods_count = 3`
  - `whatsapp_phone = "994557252025"`
  - `whatsapp_configured = true`
  - `whatsapp_source = "database"`
  - `whatsapp_updated_at = "2026-04-23T23:05:22.324Z"`
- Public `GET https://api.bazari.site/api/payment-methods` also returns `whatsapp_phone = "994557252025"` and `whatsapp_configured = true`.
- The visible `+994 12 345 67 89` strings in storefront/JSON-LD are placeholder contact text and should not be treated as the checkout line.
- Render automation progress on this machine:
  - official Render docs were checked; env updates are supported through the Render dashboard, API, or Render CLI
  - Render CLI `v2.15.1` was downloaded to `%TEMP%\render-cli-2.15.1`
  - `render login` created `C:\Users\User\.render\cli.yaml` with a refresh-token placeholder, but auth was not finished and no workspace is set yet
  - unauthenticated `render workspaces` still says `run render login to authenticate`
  - Render CLI env updates remain blocked until auth is completed, but the current WhatsApp checkout number is live through the admin/database setting and does not require a Render env update
- On 2026-04-24 later in the same thread, the WhatsApp checkout number became admin-editable in code:
  - backend now reads `app_settings.whatsapp_order_phone` before env fallback
  - admin route added: `PUT /api/admin/payment-methods/whatsapp-phone`
  - admin payment payload now also returns `whatsapp_source` and `whatsapp_updated_at`
  - `src/pages/AdminPanel.jsx` now includes a WhatsApp phone save/reset form in the payments tab
  - cart warning text was updated so it points the operator to the admin panel instead of env-only setup
- Local verification for that feature passed on an isolated temporary DB:
  - root `npm run build` passed after the admin UI changes
  - backend syntax checks passed for the touched payment/admin files
  - isolated backend smoke confirmed:
    - initial `whatsapp_configured = false`
    - saving `+994 50 111 22 33` persisted as `994501112233`
    - public `GET /api/payment-methods` immediately reflected the saved number
    - reset returned `whatsapp_configured = false` again
    - invalid short input returned `400`
- On 2026-04-24 after user approval, the feature was pushed and deployed live:
  - commit pushed to `main`: `8c2d80b` - `Make WhatsApp checkout phone editable from admin`
  - manual Vercel production deploy succeeded:
    - deployment id: `dpl_2JAUHfGtAUE3c2z3zu7CQW4iYoNu`
    - deployment url: `https://bazari-explorer-bl5ge7unu-metrekareup1-3268s-projects.vercel.app`
    - alias confirmed again on `https://www.bazari.site`
  - Render backend updated as well; live `GET /api/admin/payment-methods` now returns:
    - `whatsapp_source`
    - `whatsapp_updated_at`
  - safe production route smoke also passed:
    - login to live admin still works
    - `PUT https://api.bazari.site/api/admin/payment-methods/whatsapp-phone` with empty string returns `whatsapp_phone = ""`, `whatsapp_configured = false`, `whatsapp_source = "unset"`
  - live frontend verification was done by fetching the production JS bundle and confirming it now contains:
    - `whatsapp-phone-input`
    - `save-whatsapp-phone-btn`
    - `reset-whatsapp-phone-btn`
- On 2026-04-24 after that, the user asked for Bazari branding in place of the legacy `Modamall` wordmark:
  - user-provided asset copied to `public/bazari-logo.jpg`
  - new shared mark component added: `src/components/layout/BrandMark.jsx`
  - visible frontend brand marks updated in:
    - `src/components/layout/Header.jsx`
    - `src/components/layout/Footer.jsx`
    - `src/pages/LoginPage.jsx`
    - `src/pages/AdminPanel.jsx`
  - metadata/SEO/PWA branding updated in:
    - `src/components/seo/JsonLd.jsx`
    - `src/routes/__root.tsx`
    - `public/manifest.json`
    - `public/sw.js`
  - frontend `npm run build` passed after the branding swap
- On 2026-04-24 after that branding change, the frontend rebrand was pushed and deployed live:
  - commit pushed to `main`: `b6e879c` - `Rebrand storefront to Bazari`
  - manual Vercel production deploy succeeded:
    - deployment id: `dpl_MZoPDHSTcXEuH3j1qd6CBJtSviNn`
    - deployment url: `https://bazari-explorer-jh2bk678b-metrekareup1-3268s-projects.vercel.app`
    - alias confirmed again on `https://www.bazari.site`
  - live smoke passed:
    - homepage HTML contains `Bazari - Premium Marketplace`
    - login route HTML contains `Bazari`
    - `https://www.bazari.site/bazari-logo.jpg` returns `200`
    - live `manifest.json` now reports `short_name = "Bazari"`
- On 2026-04-25, the user reported a phone-only add-to-cart failure where the screen shows `Something went wrong` even though desktop add-to-cart works:
  - Live mobile CDP smoke on `https://www.bazari.site/product/69ea342414e252d11f447f24` showed logged-in `POST https://api.bazari.site/api/cart/add` returns `200`; the test cart was cleared afterward.
  - The mobile page load also emitted React hydration error `#418`.
  - Likely root cause found in frontend markup: product lists wrapped the whole `ProductCard` in a React Router `<Link>` while `ProductCard` itself rendered favorite/cart `<button>` controls, creating invalid nested interactive DOM that is fragile on mobile hydration/touch.
  - Local fix keeps UI shape but removes nested anchors/buttons: `ProductCard` now links only image/text areas internally and keeps favorite/cart buttons as sibling controls.
  - Updated wrappers in `src/components/home/ProductGrid.jsx`, `src/components/home/FlashDeals.jsx`, `src/pages/CategoryPage.jsx`, and `src/pages/ProductDetail.jsx`.
  - `ProductCard` card-level cart button now calls the shared `addToCart` flow instead of only stopping propagation.
  - After the first production deploy for this fix, mobile CDP still showed hydration `#418`; `src/routes/index.tsx` and `src/routes/$.tsx` were updated so the browser-only app waits until client mount before rendering, matching server `null` output during hydration.
  - `npm.cmd run build` passed. `npm.cmd run lint` was attempted but timed out after roughly 3 minutes in this shell.
  - Commits pushed to `main`:
    - `29372ca` - `Fix mobile product cart interactions`
    - `4c0d721` - `Avoid hydration mismatch for mobile cart flow`
  - Final Vercel production deploy succeeded:
    - deployment id: `dpl_FtEekd3NNquhHv19zpKH5wBuhgFD`
    - deployment url: `https://bazari-explorer-847qfmogg-metrekareup1-3268s-projects.vercel.app`
    - alias confirmed on `https://www.bazari.site`
  - Post-deploy live mobile verification passed on `https://www.bazari.site/product/69ea342414e252d11f447f24`:
    - new deployed asset was detected
    - page did not show `Something went wrong`
    - hydration exception count was `0`
    - logged-in `POST https://api.bazari.site/api/cart/add` returned `200`
    - the admin test cart was cleared afterward with live `DELETE /api/cart/clear`, returning `count = 0`
- Later on 2026-04-25, the user shared a real Android Chrome screenshot still showing `Something went wrong` after tapping `Səbətə əlavə et`:
  - The screenshot showed Chrome Translate UI, and root HTML still declared `lang="en"`, which can make Chrome translate/mutate React-managed text nodes on the phone.
  - `src/routes/__root.tsx` was updated to mark the app as Azerbaijani and opt out of translation:
    - `<html lang="az" translate="no" className="notranslate">`
    - `<body className="notranslate">`
    - `<meta name="google" content="notranslate">`
  - This targets the remaining phone-only failure mode where the cart API succeeds but a React state update after click hits TanStack's error boundary because browser translation touched the DOM.
  - `npm.cmd run build` passed after this change.
  - Commit pushed to `main`: `6174d3f` - `Disable browser translation for app shell`.
  - Vercel production deploy succeeded:
    - deployment id: `dpl_7XRmqCccNEj5QZk8g3y9WinkioLg`
    - deployment url: `https://bazari-explorer-2brig76c4-metrekareup1-3268s-projects.vercel.app`
    - alias confirmed on `https://www.bazari.site`
  - Live HTML check confirmed `lang="az"`, `translate="no"`, `notranslate`, and `meta name="google" content="notranslate"`.
  - Post-deploy Android-like mobile CDP verification passed:
    - product page did not show `Something went wrong`
    - runtime exception count was `0`
    - logged-in `POST https://api.bazari.site/api/cart/add` returned `200`
    - the admin test cart was cleared afterward and live `DELETE /api/cart/clear` returned `count = 0`
- Later on 2026-04-25, the user reported Azerbaijani letters showing as literal Unicode escapes like `\u0259` in visible UI text:
  - affected source text was normalized from escaped `\uXXXX` sequences to real UTF-8 Azerbaijani letters in `src`, `public`, and relevant backend message files
  - the global font stack was switched to a single `Noto Sans` family for body and heading utilities to keep Azerbaijani glyphs visually consistent and avoid mixed fallback weights inside words
  - local verification passed: no remaining Azerbaijani `\uXXXX` escapes or common mojibake pattern were found under `src`, `public`, or `backend/src`
  - `npm.cmd run build` passed
  - `node --check backend/src/paymentMethods.js` and `node --check backend/src/routes/admin.js` passed
  - `npm.cmd run lint` was attempted but timed out after roughly 3 minutes in this Windows shell
  - commit pushed to `main`: `5f51b73` - `Fix Azerbaijani text rendering and font`
  - Vercel production deploy succeeded:
    - deployment id: `dpl_EAhYy2UWzJWzDbWN9AqY1yuoTKek`
    - deployment url: `https://bazari-explorer-iejckqhn3-metrekareup1-3268s-projects.vercel.app`
    - alias confirmed on `https://www.bazari.site`
  - post-deploy live verification passed:
    - `https://www.bazari.site` -> `200`
    - `https://api.bazari.site/api/health` -> `200`
    - live CSS contains `Noto Sans`
    - live CSS no longer contains `Outfit` or `Manrope`
    - public payment payload still shows `whatsapp_phone = "994557252025"` and `whatsapp_configured = true`
- Later on 2026-04-25, the user asked to make the mobile bottom nav `Kateqoriya` button show a category list instead of acting like a home link:
  - `src/components/layout/MobileBottomNav.jsx` now renders the category nav item as a button
  - tapping it opens a mobile bottom sheet
  - the sheet fetches live categories from `/api/categories`
  - it falls back to local static categories only if the API fails or returns empty
  - each category row links to `/category/:slug`
  - the sheet closes via backdrop, close button, Escape, or category selection
  - category routes now mark the bottom nav category item as active
  - local `npm.cmd run build` passed
  - commit pushed to `main`: `cb46a75` - `Enable mobile category sheet`
  - Vercel production deploy succeeded:
    - deployment id: `dpl_7HRUVEcG7gh9ihCC81Rz3Kr2foNr`
    - deployment url: `https://bazari-explorer-ek9t3alps-metrekareup1-3268s-projects.vercel.app`
    - alias confirmed on `https://www.bazari.site`
  - post-deploy live mobile CDP verification passed:
    - `nav-categories` found
    - tap set `aria-expanded = "true"`
    - `category-sheet` appeared
    - `linkCount = 3`
    - live links were `Premium hesablar`, `SMM xidmətləri`, `Streaming paketləri`
    - runtime exception count `0`
    - `Something went wrong` absent
  - final live smoke passed: `https://www.bazari.site` -> `200`, API health -> `200`, public WhatsApp payment payload still configured

- On 2026-04-26, the product detail image gallery was activated:
  - `src/pages/ProductDetail.jsx` now tracks the active image for each product
  - the main product image can be changed by manual swipe/drag
  - thumbnail buttons below the image change the active image
  - previous/next overlay controls and a `1/n` image counter appear when multiple images exist
  - local `npm.cmd run build` passed
  - commit `9a582d8` pushed to `main`
  - Vercel production deploy `dpl_AdSDwSTUBfHPNKVAaFkZuvahZ1bR` completed and was aliased to `www.bazari.site`
  - live mobile CDP verification passed on `/product/69ea342614e252d11f447f26`: thumbnail tap changed the image, swipe right/left changed images, active thumbnail state updated, runtime exceptions were `0`, and failed requests were `0`

## What has already been done
- On 2026-04-23 later in the live-first production pass, the storefront/homepage mismatch was fixed on the live site:
  - production `GET https://api.bazari.site/api/homepage` was confirmed broken first (`404`)
  - root cause: the live frontend was falling back to static showcase product arrays because the live backend still did not expose `/api/homepage`
  - frontend was tightened so homepage product sections no longer fall back to static mock product cards when `/api/homepage` is missing or empty
  - backend homepage route from the local fix was shipped to production
  - commit pushed to `main`: `b1979ba` - `Show only live admin products on homepage`
  - a fresh Vercel production deploy succeeded:
    - deployment id: `dpl_AZ6fiz3ysrjJuGVuStKJHrPASFam`
    - deployment url: `https://bazari-explorer-73ho27q0s-metrekareup1-3268s-projects.vercel.app`
    - alias confirmed on `https://www.bazari.site`
  - Render picked up the backend push and `GET https://api.bazari.site/api/homepage` now returns `200`
  - the obvious dummy production product `dsvxdczv` (`69e9f5f1a3cd481c93e2a873`) was deleted live through the admin API
  - live verification after deploy passed:
    - `GET https://api.bazari.site/api/homepage` -> `200`
    - `GET https://api.bazari.site/api/products?limit=10` -> `total = 3`
    - dummy product no longer appears in live products
    - current production frontend bundle no longer contains placeholder showcase product strings like `Premium Wireless ANC`
- On 2026-04-23, the local storefront visibility bug was diagnosed and fixed:
  - admin product create was already working against the backend
  - the homepage in `src/App.jsx` was trying to load `/api/homepage`, but the backend had no `/api/homepage` route yet
  - because of that, the homepage kept falling back to static mock sections, so newly added products did not appear on the site
  - `backend/src/routes/homepage.js` was added and wired in `backend/src/server.js`
  - the new route now returns live `categories`, `flash_deals`, `trending`, and `recommended` data from MongoDB
  - `backend/src/routes/products.js` sorting was tightened to `_id: -1` so newly created products surface first more reliably even with legacy mixed `created_at` data
  - local smoke verification passed: a temporary admin-created product appeared in both `GET /api/products` and `GET /api/homepage`, then was deleted again
- On 2026-04-23 later in the local resume flow, localhost was raised again without touching the dirty worktree:
  - backend was already listening on `http://127.0.0.1:10000`
  - root frontend `npm run dev` was started again from the repo root
  - ports `8080` and `8081` were already occupied in this environment, so Vite moved to `http://localhost:8082/`
  - `http://127.0.0.1:8082` returned `200`
  - `http://127.0.0.1:10000/api/health` returned `200`
- Local frontend and backend envs were set up and both apps run locally.
- MongoDB Atlas and Cloudinary were wired locally.
- Backend health check works at `http://127.0.0.1:10000/api/health`.
- Admin bootstrap support was added:
  - `backend/src/bootstrap.js`
  - `backend/src/server.js` now calls it after DB connect
  - `backend/.env.example` includes `ADMIN_BOOTSTRAP_*`
- `src/pages/LoginPage.jsx` was updated so login errors read backend `error` responses.
- `src/lib/api.js` was tightened:
  - use `VITE_BACKEND_URL` or `VITE_API_URL`
  - otherwise fall back to relative `/api`
  - no stale hardcoded Render fallback
- Production env templates were added:
  - `.env.production.example`
  - `backend/.env.production.example`
- Backend deployment notes were updated in `backend/README.md`.
- Payment method management was added:
  - public `GET /api/payment-methods`
  - admin `GET/PUT /api/admin/payment-methods`
  - storage in MongoDB `payment_methods`
  - WhatsApp order phone now supports MongoDB `app_settings` override first, with env fallback
- Cart responses now include `product_id` alongside embedded product data.
- Local runtime verification already passed for:
  - admin login
  - `GET /api/auth/me`
  - `GET /api/payment-methods`
  - admin toggle of payment methods
  - cart add flow with the new mock products
- No `TODO` / `FIXME` / `HACK` markers were found under `src/` or `backend/src/` during this handoff refresh.
- On 2026-04-23 evening (Asia/Baku), live DNS and hosting were re-checked:
  - `bazari.site` redirects to `https://www.bazari.site/` on Vercel
  - `www.bazari.site` now returns `200` on Vercel after a fresh production deploy
  - `api.bazari.site` resolves to `bazari-explorer.onrender.com`
  - `https://api.bazari.site/api/health` returns `200`
- Vercel CLI was authenticated in this shell as `metrekareup1-3268`.
- The frontend repo was linked to the existing Vercel project `bazari-explorer`.
- Vercel production and development envs were refreshed for:
  - `VITE_BACKEND_URL=https://api.bazari.site`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- The frontend deploy path was repaired for Vercel:
  - `package.json` now includes `nitro`
  - `vite.config.ts` now disables the Cloudflare build plugin on Vercel and adds `nitro()`
  - plain local `npm run build` still works
  - `VERCEL=1 npm run build` now emits `.vercel/output` with a fallback function and bundled `cloudinary.functions`
- A direct Vercel production deploy from this dirty worktree succeeded:
  - deployment id: `dpl_4hwrtwU33mNVvVbfrq7GPuXTrWpN`
  - deployment url: `https://bazari-explorer-g2fuqfebp-metrekareup1-3268s-projects.vercel.app`
  - aliases include `https://www.bazari.site` and `https://bazari.site`
- The current dirty worktree was committed and pushed to GitHub `main`:
  - commit: `bea0ab1` - `Ship production auth, payment methods, and Vercel frontend fix`
- Render picked up the pushed backend after a few minutes:
  - `https://api.bazari.site/api/health` returns `200`
  - `https://api.bazari.site/api/payment-methods` now returns `200` JSON
- Production auth/payment checks now passed:
  - admin login on `https://api.bazari.site/api/auth/login`
  - `GET https://api.bazari.site/api/auth/me`
  - `GET https://api.bazari.site/api/admin/payment-methods`
  - payment method toggle + revert on `card`
- On 2026-04-23 later in the same production pass, the live smoke checks were re-run and still passed:
  - `https://www.bazari.site` returns `200`
  - `https://bazari.site` redirects to `https://www.bazari.site/`
  - `https://api.bazari.site/api/health` returns `200`
  - `https://api.bazari.site/api/payment-methods` returns `200`
- Cloudinary upload is now verified end-to-end on production without leaving junk data behind:
  - frontend server function `https://www.bazari.site/_serverFn/712c2064fef4d1f379338c6033503ed3ba828c7a1ff75e70dfc68b1eaf98805b` returned a valid signed upload payload
  - a real PNG smoke upload to Cloudinary succeeded on the production cloud
  - production admin auth still works, and the uploaded image URL was used to create a temporary product that was immediately deleted again
- Latest production WhatsApp state after the 2026-04-25 live re-check:
  - public `GET /api/payment-methods` returns `whatsapp_phone = "994557252025"` and `whatsapp_configured = true`
  - admin `GET /api/admin/payment-methods` returns the same phone, `whatsapp_source = "database"`, and a populated `whatsapp_updated_at`
  - the old env-only WhatsApp gap is closed on live; do not reintroduce a hardcoded phone or frontend-only fallback

## Current local mock catalog
These records were seeded directly into the local MongoDB for checkout testing on 2026-04-23.

Categories:
- `69ea342214e252d11f447f1f` - `premium-hesablar`
- `69ea342314e252d11f447f21` - `smm-xidmetleri`
- `69ea342414e252d11f447f23` - `streaming-paketleri`

Products:
- `69ea342414e252d11f447f24` - `ChatGPT Plus 1 ayliq`
- `69ea342514e252d11f447f25` - `Instagram izleyici paketi 5K`
- `69ea342614e252d11f447f26` - `Netflix Premium 1 ayliq`

Legacy dummy product still present:
- `69e9f5f1a3cd481c93e2a873` - `dsvxdczv`

Last known cart check:
- adding product `69ea342414e252d11f447f24` with quantity `2` returned:
  - `count = 2`
  - `total = 49.8`

## Files changed or likely relevant
Current modified tracked files from `git status --short --branch`:
- `.gitignore`
- `.lovable/plan.md`
- `AGENTS.md`
- `backend/.env.example`
- `backend/README.md`
- `backend/src/db.js`
- `backend/src/routes/homepage.js`
- `backend/src/routes/admin.js`
- `backend/src/routes/cart.js`
- `backend/src/routes/products.js`
- `backend/src/server.js`
- `package-lock.json`
- `package.json`
- `src/lib/api.js`
- `src/pages/AdminPanel.jsx`
- `src/pages/CartPage.jsx`
- `src/pages/LoginPage.jsx`
- `src/routeTree.gen.ts`
- `vite.config.ts`

Current untracked files:
- `.env.production.example`
- `NEW_THREAD_HANDOFF.md`
- `backend/.env.production.example`
- `backend/package-lock.json`
- `backend/src/bootstrap.js`
- `backend/src/paymentMethods.js`
- `backend/src/routes/paymentMethods.js`

Other likely relevant files:
- `backend/package.json`
- `wrangler.jsonc`
- `src/server/cloudinary.functions.ts`
- `.vercel/project.json` (local link file, ignored)

## Important decisions made
- Keep the split architecture:
  - frontend app in the repo root
  - separate Express backend in `backend/`
- Keep MongoDB logic on the backend, not in the browser.
- Keep Cloudinary signing in frontend server functions.
- Keep auth cookie-based for now.
- The repo still supports Cloudflare-style local builds, but the active production frontend path is now `Vercel + Render` because:
  - `bazari.site` nameservers and project mapping are already on Vercel
  - Vercel CLI is authenticated in this shell
  - a direct production deploy fixed the broken `www.bazari.site` 404
- `vite.config.ts` should keep the conditional adapter split:
  - default/local build: existing Cloudflare plugin path
  - Vercel build (`VERCEL=1`): Nitro output for Vercel Functions
- Use env-driven configuration everywhere; no hardcoded production domains or secrets.
- Keep payment method availability server-driven so admin and cart stay in sync.
- Preserve the existing UI; deployment and checkout work should not turn into a redesign.
- Preserve the dirty worktree; do not reset or clean it during resume work.

## Assumptions and constraints
- The user wants concise Azerbaijani progress updates.
- The user does not want secrets hardcoded.
- The user does not want the app redesigned while deployment work is ongoing.
- The local admin account should come from the current `backend/.env` bootstrap values.
- Provider auth and live DNS state may have changed outside this shell; re-check before acting on deployment assumptions.

## Remaining tasks
- Re-run a live cart checkout redirect smoke when the next checkout-related task starts and confirm the cart CTA builds `https://wa.me/994557252025?text=...` without placing a real order.
- Complete Render authentication/workspace selection only if future deployment/env work needs Render CLI access.
- Optionally add preview envs on Vercel if preview deployments need the same Cloudinary/server config.
- Optional cleanup after user confirmation:
  - remove the legacy dummy product `dsvxdczv`
  - replace or script the local mock catalog seed so it is reproducible after a DB reset

## Known issues / risks
- The worktree is already dirty with both code changes and generated output; do not assume a clean git baseline.
- `src/routeTree.gen.ts` is generated and may keep changing after builds.
- The mock catalog exists only in local MongoDB right now; it is not seeded by a checked-in script.
- The legacy dummy product `dsvxdczv` is still in the local product list.
- `www.bazari.site` and the production API are now live on the current codepath.
- Preview envs were not refreshed on Vercel during this pass; only Production and Development were updated.
- `VERCEL=1 npm run build` completes the Nitro/Vercel output, but Windows hits `EPERM` when Nitro tries to create the final `.vercel/output -> node_modules/.nitro/last-build` symlink; the remote Vercel Linux build succeeds anyway.
- Wrangler is still not authenticated in this shell.
- Production backend responses now show `whatsapp_phone = "994557252025"` and `whatsapp_configured = true`; preserve this DB-backed behavior.
- Render CLI is now present only in `%TEMP%\render-cli-2.15.1`; it is not installed globally and still needs completed login/workspace setup before it can update services.
- Placeholder storefront phone strings must not be promoted into code; the live checkout number is admin/database-driven.
- Storefront/homepage product mismatch is no longer an open production issue; the live homepage now has a working data route and fake product fallback is disabled.

## Exact next 5 actions for the next thread
1. Run `git status --short --branch` in `C:\Users\User\.codex\worktrees\7a2e\bazari-explorer` and preserve the current dirty tree exactly as-is.
2. Read `AGENTS.md`, `NEW_THREAD_HANDOFF.md`, and `.lovable/plan.md`, then confirm the current live state:
   - `https://www.bazari.site` should be `200`
   - `https://bazari.site` should redirect to `https://www.bazari.site/`
   - `https://api.bazari.site/api/health` should be `200`
   - `https://api.bazari.site/api/payment-methods` should be `200` JSON
3. Confirm public and admin payment method payloads still show `whatsapp_phone = "994557252025"`, `whatsapp_configured = true`, and admin `whatsapp_source = "database"`.
4. For checkout work, run a safe live redirect smoke and confirm the cart CTA targets `https://wa.me/994557252025?text=...`.
5. Complete Render login/workspace setup only if future Render deployment or env work requires CLI access.

## Commands to run for verification
Root app:
- `cd C:\Users\User\.codex\worktrees\7a2e\bazari-explorer`
- `npm install`
- `npm run build`
- `$env:VERCEL='1'; npm run build` (expect Nitro output plus a Windows symlink warning at the very end)
- `npm run lint`

Backend:
- `cd C:\Users\User\.codex\worktrees\7a2e\bazari-explorer\backend`
- `npm install`
- `npm run dev`

Local API checks:
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:10000/api/health`
- `Invoke-RestMethod http://127.0.0.1:10000/api/payment-methods`
- `Invoke-RestMethod http://127.0.0.1:10000/api/products?limit=50`

Live production checks:
- `curl.exe -I https://www.bazari.site`
- `curl.exe -I https://bazari.site`
- `curl.exe -I https://api.bazari.site/api/health`
- `curl.exe https://api.bazari.site/api/payment-methods`

Local auth check using the current bootstrap admin from `backend/.env`:
```powershell
$body = @{
  email = '<ADMIN_BOOTSTRAP_EMAIL_FROM_backend/.env>'
  password = '<ADMIN_BOOTSTRAP_PASSWORD_FROM_backend/.env>'
} | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:10000/api/auth/login' -ContentType 'application/json' -Body $body -SessionVariable sess
Invoke-RestMethod -Method Get -Uri 'http://127.0.0.1:10000/api/auth/me' -WebSession $sess
```

Local cart check against the current mock product data:
```powershell
$body = @{
  email = '<ADMIN_BOOTSTRAP_EMAIL_FROM_backend/.env>'
  password = '<ADMIN_BOOTSTRAP_PASSWORD_FROM_backend/.env>'
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:10000/api/auth/login' -ContentType 'application/json' -Body $body -SessionVariable sess | Out-Null
Invoke-RestMethod -Method Delete -Uri 'http://127.0.0.1:10000/api/cart/clear' -WebSession $sess | Out-Null
$add = @{ product_id = '69ea342414e252d11f447f24'; quantity = 2 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:10000/api/cart/add' -ContentType 'application/json' -Body $add -WebSession $sess
```

## Resume prompt
Read `AGENTS.md`, `NEW_THREAD_HANDOFF.md`, and `.lovable/plan.md` in `C:\Users\User\.codex\worktrees\7a2e\bazari-explorer`, then continue the `bazari.site` production deployment. Start with `git status`, preserve the existing uncommitted work, re-check the current DNS/deploy state before acting, and continue without redesigning the app or hardcoding secrets.

Current live summary as of 2026-04-26:
- frontend: fixed on Vercel, `www.bazari.site` returns `200`
- apex: `bazari.site` redirects to `www`
- backend: `api.bazari.site/api/health` and `/api/payment-methods` both return `200`
- auth/admin: production login, `/api/auth/me`, and payment method toggle all passed
- Cloudinary: production upload smoke now passed through the live frontend server function and a temporary admin product create/delete cycle
- storefront homepage: production now uses the live admin-managed product feed instead of static showcase product cards
- product detail gallery: production now supports thumbnail taps, swipe/drag, previous/next controls, and active image counter
- WhatsApp checkout: public and admin payloads now show `whatsapp_phone = "994557252025"`, `whatsapp_configured = true`, and admin `whatsapp_source = "database"`
