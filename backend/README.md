# Modamall Backend (Node.js + Express + MongoDB)

External backend for the Modamall frontend.

## Local development

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Fill in at least `MONGODB_URI`, `JWT_SECRET`, and `CORS_ORIGINS` before starting.

The server runs on `http://localhost:10000`.

## Deploy to Render

1. Push this repo to GitHub.
2. In Render, create a new Web Service from this repo.
3. Use these service settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`
4. Add environment variables from [`backend/.env.production.example`](C:/Users/User/.codex/worktrees/7a2e/bazari-explorer/backend/.env.production.example):
   - `MONGODB_URI`
   - `DB_NAME`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `ADMIN_BOOTSTRAP_EMAIL`
   - `ADMIN_BOOTSTRAP_PASSWORD`
   - `ADMIN_BOOTSTRAP_NAME`
   - `ADMIN_BOOTSTRAP_PHONE`
   - `CORS_ORIGINS=https://bazari.site,https://www.bazari.site`
   - `COOKIE_SECURE=true`
   - `COOKIE_SAMESITE=none`
  - `WHATSAPP_ORDER_PHONE` (optional fallback if admin panel override is empty)
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
5. After the first deploy, add the custom domain `api.bazari.site` in Render.
6. Update DNS for `api.bazari.site` in your registrar to the Render target shown by Render.
7. Verify `https://api.bazari.site/api/health`.
8. In the frontend host, set `VITE_BACKEND_URL=https://api.bazari.site`.

## MongoDB Atlas

- Make sure Network Access allows Render to connect.
- Create a database user with read/write permissions.

## Bootstrap an admin

The backend can create the first admin user from env on startup:

- `ADMIN_BOOTSTRAP_EMAIL`
- `ADMIN_BOOTSTRAP_PASSWORD`
- `ADMIN_BOOTSTRAP_NAME`
- `ADMIN_BOOTSTRAP_PHONE`

After the admin exists, remove the bootstrap password from the production env.

## API surface

All endpoints are prefixed with `/api`.

- `POST /api/auth/register` `{ name, email, password, phone? }`
- `POST /api/auth/login` `{ email, password }`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/2fa/setup`
- `POST /api/auth/2fa/verify` `{ code }`
- `GET /api/products?category=&q=&limit=&page=`
- `GET /api/products/:id`
- `POST /api/products` (admin/seller)
- `PUT /api/products/:id` (admin/seller)
- `DELETE /api/products/:id` (admin/seller)
- `GET /api/categories`
- `POST /api/categories` (admin)
- `PUT /api/categories/:id` (admin)
- `DELETE /api/categories/:id` (admin)
- `GET /api/cart`
- `POST /api/cart/add` `{ product_id, quantity }`
- `PUT /api/cart/update` `{ product_id, quantity }`
- `DELETE /api/cart/remove/:productId`
- `DELETE /api/cart/clear`
- `GET /api/payment-methods`
- `GET /api/reviews/:productId`
- `POST /api/reviews/:productId` `{ rating, comment }`
- `GET /api/search/autocomplete?q=`
- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `POST /api/notifications/read/:id`
- `POST /api/notifications/read-all`
- `POST /api/notifications/send` (admin) `{ title, message, type }`
- `POST /api/push/subscribe` `{ subscription }`
- `POST /api/push/unsubscribe`
- `POST /api/push/send` (admin) `{ title, message, url }`
- `GET /api/admin/users` (admin)
- `PUT /api/admin/users/:id/role` (admin) `{ role }`
- `GET /api/admin/payment-methods` (admin)
- `PUT /api/admin/payment-methods/whatsapp-phone` (admin) `{ whatsapp_phone }`
- `PUT /api/admin/payment-methods/:id` (admin) `{ is_active }`
