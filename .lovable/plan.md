# Active Plan

## Current objective
Finish the `bazari.site` production cutover without redesigning the app:
- frontend live on Vercel custom domains
- backend live on Render at `api.bazari.site`
- HTTPS login, payment methods, Cloudinary upload, and WhatsApp checkout all verified

## Current live state
- `https://www.bazari.site` returns `200` on Vercel
- `https://bazari.site` redirects to `https://www.bazari.site/`
- `https://api.bazari.site/api/health` returns `200`
- `https://api.bazari.site/api/payment-methods` returns `200` JSON

## Already completed
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

## Open deployment tasks
1. Verify Cloudinary upload from admin on the live site
2. Set `WHATSAPP_ORDER_PHONE` in production if the user wants WhatsApp checkout enabled
3. Verify WhatsApp checkout redirect after that env is set
4. Optionally sync preview envs on Vercel

## Constraints
- preserve the dirty worktree; do not reset it
- do not hardcode secrets into source files
- do not redesign the app while deployment work is ongoing
- keep payment method availability server-driven

## Risks
- production backend still reports `whatsapp_configured: false`
- `src/routeTree.gen.ts` is generated and may keep changing
- Windows local `VERCEL=1 npm run build` ends with a Nitro symlink `EPERM`, but the remote Vercel build succeeds

## References
- durable repo guidance: `AGENTS.md`
- full current-state handoff: `NEW_THREAD_HANDOFF.md`
