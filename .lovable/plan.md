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
- production admin payment payload was re-checked on 2026-04-24 and still shows `whatsapp_configured: false`

## Already completed
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

## Open deployment tasks
1. Obtain the real WhatsApp order number if it has not been provided yet
2. Set the live WhatsApp order number from the admin panel
3. Verify `GET /api/payment-methods` and admin payload after that update
4. Verify WhatsApp checkout redirect after that admin update
5. Optionally sync preview envs on Vercel

## Constraints
- preserve the dirty worktree; do not reset it
- do not hardcode secrets into source files
- do not redesign the app while deployment work is ongoing
- keep payment method availability server-driven
- keep the WhatsApp checkout phone configurable from backend/admin state, not frontend constants

## Risks
- production backend still reports `whatsapp_configured: false`
- `src/routeTree.gen.ts` is generated and may keep changing
- Windows local `VERCEL=1 npm run build` ends with a Nitro symlink `EPERM`, but the remote Vercel build succeeds
- Until a live WhatsApp number is saved, the cart CTA cannot build the live `wa.me` redirect and stays blocked by design
- placeholder storefront phone text exists in the UI and must not be treated as the real WhatsApp order line
- Render CLI `v2.15.1` is available only in `%TEMP%\render-cli-2.15.1`; login/workspace setup is still incomplete

## References
- durable repo guidance: `AGENTS.md`
- full current-state handoff: `NEW_THREAD_HANDOFF.md`
