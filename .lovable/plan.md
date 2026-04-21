

## Vəziyyət və problem

Siz haqlısınız ki, MongoDB Atlas **Data API-ı 2024-cü ildə deprecated etdi** və yeni cluster-lərdə artıq mövcud deyil. Yalnız standart `mongodb+srv://` connection string var.

**Texniki problem:** Lovable backend Cloudflare Worker mühitində işləyir. Standart MongoDB driver (`mongodb` npm paketi) TCP soket tələb edir — Worker bunu dəstəkləmir. Bu, mənim əvvəlki Data API təklifimin səbəbi idi.

**Həll:** Cloudflare-in rəsmi tövsiyə etdiyi yol — **MongoDB Atlas-ın hazırladığı `mongodb` driver-in son versiyası Worker-də `nodejs_compat` flag ilə işləyir** (2024-cü ildən bəri). Lovable-də `nodejs_compat` aktivdir, deməli birbaşa connection string ilə qoşula bilərik.

## Plan

### 1. Secrets əlavə et
Verdiyiniz dəyərləri runtime secret kimi saxlayıram:
- `MONGODB_URI` = `mongodb+srv://metrekareup1_db_user:...@cluster0.gjgebpn.mongodb.net/?appName=Cluster0`
- `MONGODB_DATABASE` = `bazari` (default DB adı)
- `CLOUDINARY_CLOUD_NAME` = `dtnqytysq`
- `CLOUDINARY_API_KEY` = `883754159872292`
- `CLOUDINARY_API_SECRET` = `SdMWLyyJBt6QPuvA-PW7cS2xna4`

### 2. MongoDB inteqrasiyası
- `mongodb` paketini quraşdır
- `src/lib/mongo.server.ts` — connection helper (cached client, lazy connect)
- Bağlantı Worker-də uğursuz olarsa (TCP problem), fallback olaraq `mongodb` paketinin yeni `bson`-only HTTP rejiminə keçərik. Əgər heç biri işləməsə, dürüst şəkildə deyəcəm və alternativ təklif edəcəm (Lovable Cloud Postgres).

### 3. Cloudinary inteqrasiyası
- `src/lib/cloudinary.server.ts` — signed upload signature generator (HMAC-SHA1, crypto modulu ilə — Worker-də işləyir)
- Cloudinary üçün npm paketi lazım deyil, sadə REST + signature

### 4. Server functions (TanStack)
`src/server/` qovluğunda:
- `homepage.functions.ts` — `getHomepage()` (kateqoriyalar, flash deals, trending, recommended)
- `products.functions.ts` — `getProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`
- `categories.functions.ts` — `getCategories`, `createCategory`
- `upload.functions.ts` — `getCloudinarySignature()` (admin frontend birbaşa Cloudinary-yə upload edir)

### 5. Frontend bağlantısı
Mövcud `axios.get('${API}/homepage')` çağırışlarını TanStack server function çağırışlarına dəyişəcəm:
- `src/App.jsx` — `HomePage` artıq `getHomepage()` server function-u çağırır
- `src/pages/AdminPanel.jsx` — məhsul CRUD + Cloudinary upload widget
- `src/pages/ProductDetail.jsx` — `getProductById`
- `src/pages/CategoryPage.jsx` — `getProducts({ category })`

### 6. Seed data
Boş DB problem yaratmasın deyə bir dəfəlik `seedDatabase()` server function yaradacam — `src/data/mockData.js`-dən mövcud kateqoriya/məhsulları MongoDB-yə yükləyir. Admin paneldən "Seed test data" düyməsi.

### 7. Test
- `invoke-server-function` ilə hər endpoint-i çağırıram
- Logs yoxlayıram
- Frontend-də homepage real DB-dən yüklənir

## Qeydlər

- **Təhlükəsizlik:** Verdiyiniz credentials artıq chat-də açıq görünüb. Test üçün ok dediniz, amma istehsal üçün mütləq rotasiya edin.
- **Worker uyğunluğu riski:** MongoDB driver-in Worker-də işləməsi bəzən versiya/şəbəkə asılıdır. İlk testdə uğursuz olarsa, dərhal sizə deyəcəm və ya (a) Atlas Cluster-də Network Access-də `0.0.0.0/0` icazəsini yoxlamağınızı xahiş edəcəm, ya da (b) Lovable Cloud Postgres-ə miqrasiya təklif edəcəm.
- **Auth:** Mövcud `AuthContext.jsx` Python backend-ə bağlıdır. Bu plan-da auth-a toxunmuram — sonrakı addım kimi MongoDB üzərində JWT auth qura bilərik (və ya Lovable Cloud auth istifadə edə bilərik).

