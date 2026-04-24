import { ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

export default function ProductGrid({ title, icon, products, testId, linkable = false }) {
  return (
    <section data-testid={testId} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E6] flex items-center justify-center">
              {icon}
            </div>
          )}
          <h2 className="font-heading font-bold text-lg sm:text-xl text-[#1A1A1A]">
            {title}
          </h2>
        </div>
        <button
          data-testid={`${testId}-see-all`}
          className="flex items-center gap-1 text-[#E05A33] font-body font-medium text-sm hover:underline"
        >
          Hamısı <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {products.map((product) =>
          linkable ? (
            <ProductCard key={product.id} product={product} linkTo={`/product/${product.id}`} />
          ) : (
            <ProductCard key={product.id} product={product} />
          )
        )}
      </div>
    </section>
  );
}
