import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";

function buildCategoryTree(categories) {
  const byParent = new Map();
  const roots = [];

  categories.forEach((category) => {
    const parentId = category.parent_id || "root";
    if (!byParent.has(parentId)) byParent.set(parentId, []);
    byParent.get(parentId).push(category);
  });

  categories.forEach((category) => {
    if (!category.parent_id) roots.push(category);
  });

  const compare = (a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name, "az");
  roots.sort(compare);
  byParent.forEach((items) => items.sort(compare));

  return roots.map((category) => ({
    ...category,
    children: byParent.get(category.id) || [],
  }));
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    let ignore = false;

    api
      .get("/categories")
      .then(({ data }) => {
        if (!ignore) setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!ignore) setCategories([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);

  return (
    <div data-testid="categories-page" className="min-h-screen bg-[#FDFCFB]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
        <div className="flex items-center gap-3 py-4">
          <Link to="/" className="sm:hidden p-2 -ml-2 rounded-xl hover:bg-gray-50">
            <ChevronLeft size={22} />
          </Link>
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0E6] text-[#E05A33] flex items-center justify-center">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-[#1A1A1A]">
              Kateqoriyalar
            </h1>
            <p className="font-body text-sm text-[#8C8C8C]">
              Ümumi kateqoriyalar və alt kateqoriyalar
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tree.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-50">
            <LayoutGrid size={42} className="mx-auto text-[#8C8C8C] mb-3" />
            <p className="font-body text-[#8C8C8C]">Kateqoriya yoxdur</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tree.map((category) => (
              <section
                key={category.id}
                data-testid={`category-group-${category.slug}`}
                className="bg-white rounded-2xl border border-gray-50 p-4"
              >
                <Link
                  to={`/category/${category.slug}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#F5F3F0] flex-shrink-0">
                    {category.image ? (
                      <img src={category.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#E05A33]">
                        <LayoutGrid size={22} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-heading font-bold text-base text-[#1A1A1A] group-hover:text-[#E05A33] transition-colors">
                      {category.name}
                    </h2>
                    <p className="font-body text-xs text-[#8C8C8C]">
                      {category.children.length ? `${category.children.length} alt kateqoriya` : "Məhsullara bax"}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-[#8C8C8C] group-hover:text-[#E05A33]" />
                </Link>

                {category.children.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        to={`/category/${child.slug}`}
                        data-testid={`subcategory-link-${child.slug}`}
                        className="rounded-xl bg-[#F5F3F0] px-3 py-2.5 font-body text-sm font-medium text-[#595959] hover:bg-[#FFF0E6] hover:text-[#E05A33] transition-colors line-clamp-1"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
