import { useState, useEffect } from "react";
import { Zap, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div data-testid="countdown-timer" className="flex items-center gap-1">
      {[
        { val: pad(timeLeft.hours), label: "s" },
        { val: pad(timeLeft.minutes), label: "d" },
        { val: pad(timeLeft.seconds), label: "sn" },
      ].map((unit, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="bg-[#1A1A1A] text-white px-2 py-1 rounded-lg min-w-[32px] text-center">
            <span className="text-sm sm:text-base font-heading font-bold tabular-nums">
              {unit.val}
            </span>
          </div>
          {i < 2 && <span className="text-[#1A1A1A] font-bold text-sm">:</span>}
        </div>
      ))}
    </div>
  );
}

export default function FlashDeals({ apiProducts }) {
  const deals = (apiProducts || []).map((p) => ({
    id: p.id,
    name: p.name,
    image: p.images?.[0] || "",
    priceNew: p.price,
    priceOld: p.original_price,
    discount: p.discount,
    rating: p.rating,
    reviews: p.review_count,
    sold: Math.floor(Math.random() * 30) + 60,
    total: 100,
  }));

  return (
    <section data-testid="flash-deals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E05A33] flex items-center justify-center flex-shrink-0">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <h2 className="font-heading font-bold text-base sm:text-xl text-[#1A1A1A] whitespace-nowrap">
              Flash Endirimlər
            </h2>
          </div>
          <CountdownTimer />
        </div>
        <button
          data-testid="flash-deals-see-all"
          className="flex items-center gap-1 text-[#E05A33] font-body font-medium text-sm hover:underline flex-shrink-0"
        >
          Hamısı <ChevronRight size={16} />
        </button>
      </div>
      <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-2 scrollbar-hide sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-visible">
        {deals.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-[170px] sm:w-auto">
            <ProductCard product={product} showProgress linkTo={`/product/${product.id}`} />
          </div>
        ))}
      </div>
    </section>
  );
}
