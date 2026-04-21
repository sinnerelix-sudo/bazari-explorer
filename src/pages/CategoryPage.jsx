import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import axios from "axios";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/home/ProductCard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      setLoading(true);
      try {
        const catRes = await axios.get(`${API}/categories`);
        const cat = catRes.data.find((c) => c.slug === slug);
        setCategory(cat);
        if (cat) {
          const prodRes = await axios.get(`${API}/products?category=${cat.id}&limit=50`);
          setProducts(prodRes.data.products || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const mapProduct = (p) => ({
    id: p.id, name: p.name, image: p.images?.[0] || "", priceNew: p.price,
    priceOld: p.original_price, discount: p.discount, rating: p.rating,
    reviews: p.review_count, badge: p.badge,
  });

  const sorted = [...products].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "discount") return (b.discount || 0) - (a.discount || 0);
    return (b.review_count || 0) - (a.review_count || 0);
  });

  return (
    <div data-testid="category-page" className="min-h-screen bg-[#FDFCFB]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-body text-[#8C8C8C] py-4">
          <Link to="/" className="hover:text-[#E05A33]">Ana səhifə</Link>
          <ChevronRight size={14} />
          <span className="text-[#1A1A1A]">{category?.name || slug}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-[#1A1A1A]">{category?.name || slug}</h1>
            <p className="font-body text-sm text-[#8C8C8C] mt-1">{products.length} məhsul</p>
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-[#8C8C8C]" />
            <select
              data-testid="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#F5F3F0] rounded-xl px-3 py-2 font-body text-sm outline-none border-none text-[#595959]"
            >
              <option value="popular">Populyar</option>
              <option value="price_asc">Qiymət: Artan</option>
              <option value="price_desc">Qiymət: Azalan</option>
              <option value="discount">Endirim</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-body text-[#8C8C8C]">Bu kateqoriyada məhsul tapılmadı</p>
            <Link to="/" className="text-[#E05A33] font-body font-medium mt-4 inline-block">Ana səhifəyə qayıt</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {sorted.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`}>
                <ProductCard product={mapProduct(p)} />
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
