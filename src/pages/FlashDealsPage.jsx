import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Flame } from "lucide-react";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/home/ProductCard";
import { api } from "@/lib/api";
import { mapProductForCard } from "@/lib/productPricing";

export default function FlashDealsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    let ignore = false;

    api
      .get("/products?flash=true&limit=100")
      .then(({ data }) => {
        if (!ignore) setProducts((data.products || []).map(mapProductForCard));
      })
      .catch(() => {
        if (!ignore) setProducts([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div data-testid="flash-deals-page" className="min-h-screen bg-[#FDFCFB]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
        <div className="flex items-center gap-3 py-4">
          <Link to="/" className="sm:hidden p-2 -ml-2 rounded-xl hover:bg-gray-50">
            <ChevronLeft size={22} />
          </Link>
          <div className="w-10 h-10 rounded-2xl bg-[#E05A33] text-white flex items-center justify-center">
            <Flame size={20} fill="currentColor" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-[#1A1A1A]">
              Flash Endirimlər
            </h1>
            <p className="font-body text-sm text-[#8C8C8C]">
              Limitli qiymətlər və sürətli kampaniyalar
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-50">
            <Flame size={42} className="mx-auto text-[#E05A33] mb-3" />
            <h2 className="font-heading font-bold text-lg text-[#1A1A1A]">
              Aktiv flash endirim yoxdur
            </h2>
            <p className="font-body text-sm text-[#8C8C8C] mt-2">
              Admin paneldən məhsula flash endirim aktiv ediləndə burada görünəcək.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showProgress
                linkTo={`/product/${product.id}`}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
