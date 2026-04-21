

## Vəziyyət

GitHub inteqrasiyası qoşulub və `bazari-explorer` reposu seçilib. Lakin Lovable-də mühüm məhdudiyyət var: **mövcud GitHub repolarını birbaşa import etmək mümkün deyil**. GitHub bağlantısı yalnız **bu Lovable layihəsinin** kodunu seçilmiş repoya **push** edir — əks istiqamətdə (repodan Lovable-ə kodu çəkmək) avtomatik işləmir.

Yəni hazırda `bazari-explorer` reposundakı kodlar Lovable layihəsinə avtomatik gəlməyəcək. Lovable layihəsi hələ də boş template (`src/routes/index.tsx` placeholder) ilə qalıb və hər yeni commit Lovable-dən repoya gedəcək — bu da `bazari.az` kodlarının üzərinə yazılma riski yaradır.

## Həll yolu

`bazari.az` kodlarını Lovable layihəsinə köçürmək üçün **manual sinxronizasiya** lazımdır. Mən repo məzmununu GitHub-dan oxuya bilərəm (public repo olduğu üçün) və faylları bir-bir Lovable layihəsinə köçürərəm. TanStack Start strukturuna uyğunlaşdırma da tələb oluna bilər.

## Plan

### 1. Repo strukturunun analizi
- `https://github.com/sinnerelix-sudo/bazari-explorer` repo məzmununu oxumaq (raw GitHub URL-ləri vasitəsilə)
- `package.json`, qovluq strukturu, framework (React/Next/Vite/TanStack?) müəyyən etmək
- Routing sistemi, komponentlər, asset-lər siyahısını çıxarmaq

### 2. Uyğunluq yoxlaması
İki ssenari mümkündür:

**A) Repo onsuz da TanStack Start + Vite-dırsa** (yəni Lovable-dən eksport edilmiş köhnə layihədir):
- Bütün `src/`, `public/`, `package.json` dependencies, config faylları olduğu kimi köçürülür
- Mövcud placeholder `src/routes/index.tsx` əvəz edilir

**B) Repo başqa stack-dırsa** (məs. Next.js, CRA, Vite+React Router):
- Komponentlər (`src/components/*`) və biznes məntiqi olduğu kimi köçürülür
- Səhifələr `src/pages/` və ya `app/` qovluğundan TanStack Start route faylına (`src/routes/*.tsx`) çevrilir
- React Router DOM istifadəsi varsa, `@tanstack/react-router`-a uyğunlaşdırılır
- Tailwind/shadcn konfiqurasiyaları birləşdirilir

### 3. Köçürmə
- Asset-lər (şəkillər, loqo, fontlar) `src/assets/` və ya `public/` qovluğuna
- Dependencies bir-bir əlavə edilir
- Environment dəyişənləri (varsa) Lovable Cloud Secrets-də qeyd üçün siyahılanır

### 4. Build və yoxlama
- TypeScript səhvləri düzəldilir
- Routing işlədiyi yoxlanılır
- Preview-də açılır

### 5. GitHub sinxronizasiyası
Köçürmə bitdikdən sonra Lovable avtomatik repoya commit edəcək — `bazari-explorer` repo Lovable layihəsinin yeni "həqiqət mənbəyi"nə çevriləcək.

## Texniki qeydlər

- Reponu `code--fetch_website` ilə `https://raw.githubusercontent.com/sinnerelix-sudo/bazari-explorer/main/<file>` formatında oxuyacağam
- Binary fayllar (şəkillər) üçün ayrı download mexanizmi lazımdır — onları `code--exec` ilə `curl` vasitəsilə endirəcəyəm
- Əgər repo private-dırsa, oxuya bilməyəcəyəm — bu halda sizdən public etməyinizi və ya kodu ZIP olaraq yükləməyinizi xahiş edəcəyəm

## Sizdən təsdiq lazımdır

1. **Repo public-dirmi?** (Mən oxuya bilim deyə)
2. İki repo göstərmisiniz — `bazari-explorer` və `bazari.az`. **Hansından kodu götürək?** (`bazari-explorer` GitHub bağlantısında seçildiyi üçün onu default qəbul edirəm)
3. Əgər repo TanStack Start deyilsə, **routing-i TanStack-ə uyğunlaşdırmağıma razısınızmı?** (Lovable yalnız TanStack Start dəstəkləyir)

Təsdiq verdikdən sonra default mode-a keçib köçürməyə başlayacağam.

