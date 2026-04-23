# AGENTS.md

## Project purpose
- `bazari-explorer` is the app for `bazari.site`: a marketplace frontend plus a separate Node/Mongo backend.
- Near-term work is centered on production deployment, admin/auth reliability, Cloudinary uploads, and a working cart/payment flow.

## Architecture overview
- Root app: TanStack Start + React + Vite in `src/`
- Frontend server functions: `src/server/`
- Backend API: Express ESM app in `backend/`
- Data: MongoDB Atlas
- Media: Cloudinary
- Frontend API access is centralized in `src/lib/api.js`
- Frontend deployment currently runs on Vercel custom domains; `vite.config.ts` now switches to Nitro when `VERCEL=1` so Vercel builds emit `.vercel/output` instead of the old empty Vite-style output.

## Important directories and files
- `src/pages/` - customer/admin page screens
- `src/components/` - shared UI pieces
- `src/contexts/` - auth/cart/global client state
- `src/lib/api.js` - axios instance and backend base URL logic
- `src/server/cloudinary.functions.ts` - signed Cloudinary upload payloads
- `vite.config.ts` - conditional deploy adapter switch (`Cloudflare` by default, `Nitro` on Vercel builds)
- `backend/src/server.js` - backend startup and route wiring
- `backend/src/bootstrap.js` - bootstrap admin creation from env
- `backend/src/paymentMethods.js` - payment method defaults and WhatsApp config helpers
- `backend/src/routes/` - auth, products, categories, cart, admin, notifications, push, reviews, search
- `backend/README.md` - deployment notes for the backend
- `.lovable/plan.md` - active plan
- `NEW_THREAD_HANDOFF.md` - current detailed state for the next thread
- `src/routeTree.gen.ts` - generated file; do not hand-edit

## Coding conventions
- Keep the current split frontend/backend architecture.
- Frontend code follows the existing local pattern: mostly `.jsx`/`.js`, React hooks, shared context, axios via `src/lib/api.js`.
- Backend code is ESM `.js` with small route modules and shared helpers in `backend/src/`.
- Prefer environment-driven configuration over hardcoded URLs, domains, credentials, or phone numbers.
- Preserve the current compact marketplace UI unless the user explicitly asks for design changes.
- Prefer ASCII in handoff/docs when terminal encoding looks unreliable; keep user-facing UI text valid UTF-8.

## Test, build, and lint commands
- Root:
  - `npm install`
  - `npm run dev`
  - `npm run build`
  - `npm run lint`
- Backend:
  - `cd backend`
  - `npm install`
  - `npm run dev`
  - `npm start`

## Safety constraints
- Never commit `.env` or `backend/.env`.
- Treat any locally exposed credentials as compromised for production; rotate before launch.
- Production cookies must use secure settings; local cookie settings are not production-safe.
- Do not hardcode production endpoints, secrets, or provider-specific values into source files.
- Do not clean or reset the existing dirty worktree unless the user explicitly asks.

## Rules for editing
- Preserve existing uncommitted work and merge carefully with it.
- Do not manually edit generated output such as `src/routeTree.gen.ts` or build artifacts in `dist/`.
- Keep payment method availability server-driven; do not fork payment rules only into the frontend.
- Update `AGENTS.md`, `NEW_THREAD_HANDOFF.md`, and `.lovable/plan.md` after meaningful changes.

## How to verify changes
- Frontend-only changes: run `npm run build`.
- Backend/auth/config changes: run the backend and verify:
  - `http://127.0.0.1:10000/api/health`
  - login flow
  - `GET /api/auth/me`
  - any touched API route
- Cart/payment changes: also verify:
  - `GET /api/payment-methods`
  - admin payment method toggle flow
  - cart add/update/clear with an authenticated session
- Deployment changes: re-check current DNS/HTTPS state before assuming any prior cutover status is still current.
- For Vercel frontend deploys, also verify `https://www.bazari.site` is `200` and `https://bazari.site` redirects to it.
- For Render backend deploys, verify both `https://api.bazari.site/api/health` and `https://api.bazari.site/api/payment-methods`.

## Workflow preferences
- The user prefers concise Azerbaijani updates and practical next steps.
- Avoid broad refactors, architecture churn, or redesign work unless explicitly requested.
- When deployment/auth state is unclear, verify it instead of assuming old thread knowledge is still current.
- Prefer finishing the current Vercel + Render production cutover over reopening the Cloudflare-vs-Vercel hosting debate unless the user explicitly redirects it.

## Recurring mistakes to avoid
- Do not reintroduce the stale Render fallback in `src/lib/api.js`; use `VITE_BACKEND_URL` or relative `/api`.
- Make sure login UI surfaces backend `response.data.error`, not only `detail`.
- Do not hardcode payment methods in frontend-only state; the backend is the source of truth.
- Watch for encoding regressions in docs or user-facing text.
- Do not revert the conditional Nitro setup in `vite.config.ts` unless the frontend host is intentionally moved off Vercel.

## Current work / handoff
- Start with `NEW_THREAD_HANDOFF.md` for the current state, open tasks, and resume prompt.
- Use `.lovable/plan.md` as the active short plan.
- As of 2026-04-23 evening (Asia/Baku), `www.bazari.site` serves the app from Vercel again, but `api.bazari.site` is still running an older Render deploy that does not expose `/api/payment-methods`.
