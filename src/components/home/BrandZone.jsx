export default function BrandZone({ brands = [] }) {
  if (brands.length === 0) return null;

  return (
    <section data-testid="brand-zone" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
      <h2 className="font-heading font-bold text-lg sm:text-xl text-[#1A1A1A] mb-4 sm:mb-6">
        Populyar brendlər
      </h2>
      <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-2 scrollbar-hide sm:grid sm:grid-cols-3 md:grid-cols-6 sm:overflow-visible">
        {brands.map((brand) => (
          <button
            key={brand.id}
            data-testid={`brand-${brand.id}`}
            className="flex-shrink-0 flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-2xl bg-[#F5F3F0] hover:bg-[#EBEBEB] transition-all duration-200 min-w-[100px] group"
          >
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
              <span className="font-heading font-bold text-lg text-[#1A1A1A]">
                {brand.letter}
              </span>
            </div>
            <span className="font-body font-medium text-xs text-[#595959]">
              {brand.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
