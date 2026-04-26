import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, RefreshCcw } from "lucide-react";
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
import HomeSkeleton from "@/components/home/HomeSkeleton";
import ProductDetail from "@/pages/ProductDetail";
import LoginPage from "@/pages/LoginPage";
import AdminPanel from "@/pages/AdminPanel";
import AuthCallback from "@/pages/AuthCallback";
import CartPage from "@/pages/CartPage";
import CategoryPage from "@/pages/CategoryPage";
import CategoriesPage from "@/pages/CategoriesPage";
import FlashDealsPage from "@/pages/FlashDealsPage";
import ProfilePage from "@/pages/ProfilePage";
import PushNotificationBanner from "@/components/notifications/PushNotificationBanner";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { mapProductForCard } from "@/lib/productPricing";

function HomePage() {
  const [homeData, setHomeData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setError(false);
    setLoading(true);
    try {
      const { data } = await api.get("/homepage");
      setHomeData(data);
    } catch (err) {
      console.error("Home data fetch error:", err);
      setError(true);
      setHomeData({
        categories: [],
        flash_deals: [],
        trending: [],
        recommended: [],
        hero_banners: [],
        campaigns: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const mapProducts = (list) =>
    list?.map((product) => ({
      ...mapProductForCard(product),
      category: product.brand || "",
      badge: product.badge,
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
        
        {loading && <HomeSkeleton />}

        {!loading && error && homeData?.trending?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 bg-[#FFF0E6] text-[#E05A33] rounded-full flex items-center justify-center mb-4">
              <RefreshCcw size={24} />
            </div>
            <h2 className="font-heading font-bold text-lg text-[#1A1A1A]">Məlumatları yükləmək mümkün olmadı</h2>
            <p className="font-body text-sm text-[#8C8C8C] mt-2 mb-6 max-w-xs">İnternet bağlantınızı yoxlayın və ya yenidən cəhd edin.</p>
            <button 
              onClick={loadData}
              className="bg-[#E05A33] text-white px-8 py-3 rounded-full font-body font-bold text-sm transition-transform active:scale-95"
            >
              Yenidən yüklə
            </button>
          </div>
        )}

        {homeData && (
          <>
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
          </>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

function AppRouter() {
  const location = useLocation();

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
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/flash-deals" element={<FlashDealsPage />} />
      <Route path="/deals" element={<FlashDealsPage />} />
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
