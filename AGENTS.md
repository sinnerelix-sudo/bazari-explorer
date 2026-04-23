# AGENTS.md

## Repo
- `bazari-explorer` powers `bazari.site`.
- Keep the split architecture: TanStack Start frontend in the repo root (`src/`), Express ESM backend in `backend/`.
- Frontend API access is centralized in `src/lib/api.js`.
- Cloudinary signing lives in `src/server/cloudinary.functions.ts`.
- Payment method rules live on the backend (`backend/src/paymentMethods.js` and related routes), not in frontend-only state.
- `src/routeTree.gen.ts` is generated; do not hand-edit it.

## Durable Rules
- Preserve the current marketplace UI and flow; no redesign, broad refactor, or framework churn unless the user asks.
- Prefer environment-driven config; never hardcode secrets, domains, provider values, or phone numbers.
- Keep auth cookie-based unless the user explicitly requests a change.
- Preserve uncommitted work and merge carefully; never reset or clean the tree without explicit approval.
- Never commit `.env` or `backend/.env`; treat exposed local secrets as needing rotation before production.
- In `src/lib/api.js`, use `VITE_BACKEND_URL` or `VITE_API_URL`, otherwise relative `/api`; never restore the old hardcoded Render fallback.
- Keep login error handling wired to backend `response.data.error`, not only `detail`.
- Keep payment method availability server-driven so admin and checkout stay in sync.
- Keep the conditional Vercel build setup in `vite.config.ts`: default/local build path stays intact, `VERCEL=1` uses Nitro for Vercel output.
- For thread-specific state, read `NEW_THREAD_HANDOFF.md` and `.lovable/plan.md`.

## Verification
- Frontend changes: run `npm run build`.
- Backend/auth/config changes: verify local `http://127.0.0.1:10000/api/health`, login, `GET /api/auth/me`, and any touched API route.
- Cart/payment changes: also verify `GET /api/payment-methods` and the admin payment method toggle flow.
- Deployment changes: re-check live DNS/HTTPS before acting.
- Current production host checks:
  - `https://www.bazari.site` should return `200`
  - `https://bazari.site` should redirect to `https://www.bazari.site/`
  - `https://api.bazari.site/api/health` should return `200`
  - `https://api.bazari.site/api/payment-methods` should return `200`

## 2026-04-24 Live Resume Notes
- The user explicitly wants this thread to stay live-first against `https://www.bazari.site` and `https://api.bazari.site`; do not fall back to localhost unless production work is blocked.
- On 2026-04-24 (Asia/Baku), the production re-check passed again:
  - `https://www.bazari.site` -> `200`
  - `https://bazari.site` -> `308` redirect to `https://www.bazari.site/`
  - `https://api.bazari.site/api/health` -> `200`
  - `https://api.bazari.site/api/payment-methods` -> `200`
  - `https://api.bazari.site/api/homepage` -> `200`
  - `https://api.bazari.site/api/products?limit=10` still returns `total = 3`
- Production admin verification was repeated via live login:
  - `GET https://api.bazari.site/api/admin/payment-methods` still shows `methods_count = 3`
  - `whatsapp_configured` is still `false`
  - `whatsapp_phone` is still empty
- Do not reuse placeholder phone strings from the storefront like `+994 12 345 67 89`; that is not a confirmed order line.
- `backend/.env` currently has no `WHATSAPP_ORDER_PHONE`, so there is no local canonical value to promote automatically.
- The current local code now supports a DB-backed WhatsApp checkout line override:
  - backend reads `app_settings.whatsapp_order_phone` first, then falls back to env `WHATSAPP_ORDER_PHONE`
  - admin can update it through `PUT /api/admin/payment-methods/whatsapp-phone`
  - the admin payments tab now exposes a WhatsApp phone form with save/reset actions
- 2026-04-24 local verification for that new flow passed on an isolated smoke DB:
  - root `npm run build` passed
  - `node --check` passed for `backend/src/server.js`, `backend/src/routes/admin.js`, `backend/src/routes/paymentMethods.js`, and `backend/src/paymentMethods.js`
  - isolated backend smoke on ports `10001` / `10002` confirmed save -> public payload update -> reset
  - invalid short phone input returns `400`
- Production still has the old live behavior until this code is deployed:
  - live `whatsapp_configured` is still `false`
  - after deploy, the real order number should be entered from the admin panel instead of relying only on Render env
- On 2026-04-24 later in the same thread, that WhatsApp admin-editable feature was pushed live:
  - commit pushed to `main`: `8c2d80b` - `Make WhatsApp checkout phone editable from admin`
  - Vercel production deploy completed manually:
    - deployment id: `dpl_2JAUHfGtAUE3c2z3zu7CQW4iYoNu`
    - deployment url: `https://bazari-explorer-bl5ge7unu-metrekareup1-3268s-projects.vercel.app`
    - alias confirmed again on `https://www.bazari.site`
  - Render backend picked up the same push quickly; live admin payload now includes:
    - `whatsapp_source`
    - `whatsapp_updated_at`
  - safe production smoke passed without setting a fake number:
    - `PUT https://api.bazari.site/api/admin/payment-methods/whatsapp-phone` with empty string returned `whatsapp_source = "unset"`
    - live frontend bundle on `www.bazari.site` contains the new admin WhatsApp input/button strings
- Render CLI `v2.15.1` was downloaded to `%TEMP%\render-cli-2.15.1`.
- `render login` was started once and created `C:\Users\User\.render\cli.yaml`, but authentication/workspace selection was not completed; Render env updates remain blocked until auth is finished.
