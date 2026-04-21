# Modamall Backend (Node.js + Express + MongoDB)

External backend for the Modamall Lovable frontend.

## Local development

```bash
cd backend
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, CORS_ORIGINS
npm install
npm run dev
```

Server runs on `http://localhost:10000`.

## Deploy to Render.com

1. Push this repo to GitHub.
2. Render Dashboard → **New → Web Service** → connect repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. Add environment variables (from `.env.example`):
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `DB_NAME` — `modamall` (or your choice)
   - `JWT_SECRET` — a long random string
   - `CORS_ORIGINS` — your Lovable URL, e.g. `https://yourapp.lovable.app`
   - `COOKIE_SECURE=true`, `COOKIE_SAMESITE=none`
5. Deploy. Copy the resulting URL (e.g. `https://modamall-backend.onrender.com`).
6. In Lovable, set secret `VITE_BACKEND_URL` to that URL.

## MongoDB Atlas

- Make sure **Network Access** allows `0.0.0.0/0` (or Render's IP range).
- Create a database user with read/write permissions.

## API surface

All endpoints are prefixed with `/api`.

- `POST /api/auth/register` `{ name, email, password, phone? }`
- `POST /api/auth/login` `{ email, password }`
- `POST /api/auth/logout`
- `GET  /api/auth/me`
- `POST /api/auth/2fa/setup`
- `POST /api/auth/2fa/verify` `{ code }`
- `GET  /api/products?category=&q=&limit=&page=`
- `GET  /api/products/:id`
- `POST /api/products` (admin/seller)
- `PUT  /api/products/:id` (admin/seller)
- `DELETE /api/products/:id` (admin/seller)
- `GET  /api/categories`
- `POST /api/categories` (admin)
- `PUT  /api/categories/:id` (admin)
- `DELETE /api/categories/:id` (admin)
- `GET  /api/cart`
- `POST /api/cart/add` `{ product_id, quantity }`
- `PUT  /api/cart/update` `{ product_id, quantity }`
- `DELETE /api/cart/remove/:productId`
- `DELETE /api/cart/clear`
- `GET  /api/reviews/:productId`
- `POST /api/reviews/:productId` `{ rating, comment }`
- `GET  /api/search/autocomplete?q=`
- `GET  /api/notifications`
- `GET  /api/notifications/unread-count`
- `POST /api/notifications/read/:id`
- `POST /api/notifications/read-all`
- `POST /api/notifications/send` (admin) `{ title, message, type }`
- `POST /api/push/subscribe` `{ subscription }`
- `POST /api/push/unsubscribe`
- `POST /api/push/send` (admin) `{ title, message, url }`
- `GET  /api/admin/users` (admin)
- `PUT  /api/admin/users/:id/role` (admin) `{ role }`

## Bootstrap an admin

After first registration, manually set the user role in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```
