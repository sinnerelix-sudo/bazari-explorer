# NEW_THREAD_HANDOFF.md

## Current objective
Keep the local cart/payment flow testable while finishing production deployment for `bazari.site`:
- frontend host for the TanStack Start app
- Render-hosted backend at `api.bazari.site`
- production Atlas and Cloudinary envs
- admin login, payment-method management, and WhatsApp checkout verified on HTTPS

## What has already been done
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
  - WhatsApp order phone comes from env
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
- Current production gap after those checks:
  - `whatsapp_phone` is still empty in production responses
  - `whatsapp_configured` is `false`
  - Cloudinary upload was not yet verified end-to-end through the admin UI

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
- `backend/src/routes/admin.js`
- `backend/src/routes/cart.js`
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
- Verify on HTTPS:
  - Cloudinary upload
  - WhatsApp checkout redirect
- Set `WHATSAPP_ORDER_PHONE` in the live backend env if the user wants the checkout redirect to be truly usable.
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
- Production backend responses currently show `whatsapp_phone: \"\"` and `whatsapp_configured: false`, so WhatsApp checkout is not fully ready yet.

## Exact next 5 actions for the next thread
1. Run `git status --short --branch` in `C:\Users\User\.codex\worktrees\7a2e\bazari-explorer` and preserve the current dirty tree exactly as-is.
2. Read `AGENTS.md`, `NEW_THREAD_HANDOFF.md`, and `.lovable/plan.md`, then confirm the current live state:
   - `https://www.bazari.site` should be `200`
   - `https://bazari.site` should redirect to `https://www.bazari.site/`
   - `https://api.bazari.site/api/health` should be `200`
   - `https://api.bazari.site/api/payment-methods` should be `200` JSON
3. Inspect the public payment method payload and confirm whether `whatsapp_configured` is still `false`.
4. If the user wants live WhatsApp checkout, set `WHATSAPP_ORDER_PHONE` in the production backend env and re-check the public payload.
5. Finish end-to-end production checks on HTTPS:
   - Cloudinary upload from admin
   - cart/payment flow
   - WhatsApp checkout redirect

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

Current live summary as of 2026-04-23:
- frontend: fixed on Vercel, `www.bazari.site` returns `200`
- apex: `bazari.site` redirects to `www`
- backend: `api.bazari.site/api/health` and `/api/payment-methods` both return `200`
- auth/admin: production login, `/api/auth/me`, and payment method toggle all passed
- remaining gap: `whatsapp_configured` is still `false`, and Cloudinary upload has not been browser-verified yet
