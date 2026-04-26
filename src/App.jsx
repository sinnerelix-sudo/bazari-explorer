import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { TrendingUp, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryBar from "@/components/home/CategoryBar";
import FlashDeals from "@/components/home/FlashDeals";
import CampaignBanner from "@/components/home/CampaignBanner";
import ProductGrid from "@/components/home/ProductGrid";
import BrandZone from "@/components/home/BrandZone";
import ProductDetail from "@/pages/ProductDetail";
import LoginPage from "@/pages/LoginPage";
import AdminPanel from "@/pages/AdminPanel";
import AuthCallback from "@/pages/AuthCallback";
import CartPage from "@/pages/CartPage";
import CategoryPage from "@/pages/CategoryPage";
import ProfilePage from "@/pages/ProfilePage";
import PushNotificationBanner from "@/components/notifications/PushNotificationBanner";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";

function HomePage() {
  const [homeData, setHomeData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/homepage`);
        setHomeData(data);
      } catch {
        setHomeData({
          categories: [],
          flash_deals: [],
          trending: [],
          recommended: [],
          hero_banners: [],
          campaigns: [],
        });
      }
    };
    load();
  }, []);

  // Map API products to component format
  const mapProducts = (list) =>
    list?.map((p) => ({
      ...p,
      id: p.id,
      name: p.name,
      image: p.images?.[0] || "",
      priceNew: p.price,
      priceOld: p.original_price,
      discount: p.discount,
      rating: p.rating,
      reviews: p.review_count,
      category: p.brand || "",
      badge: p.badge,
    })) || [];

  const trending = mapProducts(homeData?.trending);
  const recommended = mapProducts(homeData?.recommended);
  const flashDeals = homeData?.flash_deals || [];
  const heroBanners = homeData?.hero_banners || homeData?.banners || [];
  const brands = homeData?.brands || [];

  return (
    <div data-testid="homepage" className="min-h-screen bg-[#FDFCFB]">
      <OrganizationJsonLd />
      <Header />

      <main className="pb-20 md:pb-0">
        <PushNotificationBanner />
        <CategoryBar apiCategories={homeData?.categories} />
        <HeroBanner banners={heroBanners} />
        <CampaignBanner apiCampaigns={homeData?.campaigns} />

        {flashDeals.length > 0 && <FlashDeals apiProducts={flashDeals} />}

        {trending.length > 0 && (
          <ProductGrid
          title="Trend Məhsullar"
          icon={<TrendingUp size={16} className="text-[#E05A33]" />}
          products={trending}
          testId="trending-products"
          linkable
          />
        )}

        {recommended.length > 0 && (
          <ProductGrid
          title="Sənin üçün"
          icon={<Sparkles size={16} className="text-[#E05A33]" />}
          products={recommended}
          testId="recommended-products"
          linkable
          />
        )}

        <BrandZone brands={brands} />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

function AppRouter() {
  const location = useLocation();

  // Check URL fragment for session_id synchronously
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/product/:productId" element={<ProductDetail />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
