import { categories as staticCategories } from "@/data/mockData";

export default function CategoryBar({ apiCategories }) {
  const cats = apiCategories?.length
    ? apiCategories.map((c) => ({ id: c.id, name: c.name, image: c.image, slug: c.slug }))
    : staticCategories;

  return (
    <section data-testid="category-bar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
      <div className="flex items-center overflow-x-auto gap-4 sm:gap-6 pb-2 scrollbar-hide sm:justify-center sm:flex-wrap">
        {cats.map((cat) => (
          <button
            key={cat.id}
            data-testid={`category-${cat.slug}`}
            className="flex flex-col items-center gap-2 flex-shrink-0 group"
          >
            <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-[#E05A33]/30 transition-all duration-200 bg-[#F5F3F0]">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <span className="text-[11px] sm:text-xs font-body font-medium text-[#595959] group-hover:text-[#E05A33] transition-colors text-center leading-tight w-16 sm:w-[72px]">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
