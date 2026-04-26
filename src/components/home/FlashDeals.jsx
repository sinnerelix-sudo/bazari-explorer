import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Zap } from "lucide-react";
import ProductCard from "./ProductCard";
import { mapProductForCard } from "@/lib/productPricing";

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
        if (hours < 0) return { hours: 23, minutes: 59, seconds: 59 };
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div data-testid="countdown-timer" className="flex items-center gap-1">
      {[pad(timeLeft.hours), pad(timeLeft.minutes), pad(timeLeft.seconds)].map((value, index) => (
        <div key={index} className="flex items-center gap-1">
          <div className="bg-[#1A1A1A] text-white px-2 py-1 rounded-lg min-w-[32px] text-center">
            <span className="text-sm sm:text-base font-heading font-bold tabular-nums">
              {value}
            </span>
          </div>
          {index < 2 && <span className="text-[#1A1A1A] font-bold text-sm">:</span>}
        </div>
      ))}
    </div>
  );
}

export default function FlashDeals({ apiProducts }) {
  const deals = (apiProducts || []).map(mapProductForCard);

  if (deals.length === 0) return null;

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
        <Link
          to="/flash-deals"
          data-testid="flash-deals-see-all"
          className="flex items-center gap-1 text-[#E05A33] font-body font-medium text-sm hover:underline flex-shrink-0"
        >
          Hamısı <ChevronRight size={16} />
        </Link>
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
