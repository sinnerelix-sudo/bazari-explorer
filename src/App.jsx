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

// Fallback data from static file
import {
  trendingProducts as staticTrending,
  recommendedProducts as staticRecommended,
} from "@/data/mockData";

function HomePage() {
  const [homeData, setHomeData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/homepage`);
        setHomeData(data);
      } catch {
        // fallback to static
      }
    };
    load();
  }, []);

  // Map API products to component format
  const mapProducts = (list) =>
    list?.map((p) => ({
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

  const trending = homeData?.trending?.length
    ? mapProducts(homeData.trending)
    : staticTrending;
  const recommended = homeData?.recommended?.length
    ? mapProducts(homeData.recommended)
    : staticRecommended;

  return (
    <div data-testid="homepage" className="min-h-screen bg-[#FDFCFB]">
      <OrganizationJsonLd />
      <Header />

      <main className="pb-20 md:pb-0">
        <PushNotificationBanner />
        <CategoryBar apiCategories={homeData?.categories} />
        <HeroBanner />
        <CampaignBanner apiCampaigns={homeData?.campaigns} />

        <FlashDeals apiProducts={homeData?.flash_deals} />

        <ProductGrid
          title="Trend Məhsullar"
          icon={<TrendingUp size={16} className="text-[#E05A33]" />}
          products={trending}
          testId="trending-products"
          linkable
        />

        {/* Mid-page Feature Banner */}
        <section data-testid="feature-banner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
          <div className="relative overflow-hidden rounded-2xl bg-[#1A1A1A] p-6 sm:p-10 lg:p-12">
            <div className="relative z-10 max-w-lg">
              <span className="inline-block text-[#F2A65A] text-xs font-body font-semibold mb-2 uppercase tracking-wider">
                Premium keyfiyyət
              </span>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-white mb-3 leading-tight">
                Sənin üçün seçdiklərimiz
              </h2>
              <p className="font-body text-sm sm:text-base text-gray-400 mb-5 leading-relaxed">
                Ən çox bəyənilən və ən çox satılan məhsullar. Keyfiyyət və qiymət balansı.
              </p>
              <button
                data-testid="feature-cta-btn"
                className="bg-[#E05A33] hover:bg-[#D94A22] text-white px-6 py-2.5 rounded-full font-body font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-[#E05A33]/20"
              >
                Kəşf et
              </button>
            </div>
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#E05A33]/10" />
            <div className="absolute -right-8 -bottom-20 w-48 h-48 rounded-full bg-[#F2A65A]/10" />
          </div>
        </section>

        <ProductGrid
          title="Sənin üçün"
          icon={<Sparkles size={16} className="text-[#E05A33]" />}
          products={recommended}
          testId="recommended-products"
          linkable
        />

        <BrandZone />
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
