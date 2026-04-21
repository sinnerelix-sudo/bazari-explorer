import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroBanners } from "@/data/mockData";

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const total = heroBanners.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const banner = heroBanners[current];

  return (
    <section data-testid="hero-banner" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-4 sm:mt-6">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
        {/* Image */}
        <div className="relative aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden">
          {heroBanners.map((b, idx) => (
            <div
              key={b.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === current ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={b.image}
                alt={b.title}
                className="w-full h-full object-cover"
                loading={idx === 0 ? "eager" : "lazy"}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
            </div>
          ))}

          {/* Content */}
          <div className="absolute inset-0 flex items-center px-6 sm:px-12 lg:px-16">
            <div className="max-w-md">
              <span className="inline-block text-white/80 text-xs sm:text-sm font-body font-medium mb-2 tracking-wide uppercase">
                Xüsusi təklif
              </span>
              <h2 className="font-heading font-bold text-2xl sm:text-4xl lg:text-5xl text-white mb-2 sm:mb-3 leading-tight">
                {banner.title}
              </h2>
              <p className="text-white/90 font-body text-base sm:text-lg font-medium mb-4 sm:mb-6">
                {banner.subtitle}
              </p>
              <button
                data-testid="hero-cta-btn"
                className="bg-[#E05A33] hover:bg-[#D94A22] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-body font-semibold text-sm sm:text-base transition-all duration-200 hover:shadow-lg hover:shadow-[#E05A33]/20"
              >
                {banner.cta}
              </button>
            </div>
          </div>

          {/* Navigation arrows - desktop */}
          <button
            data-testid="hero-prev-btn"
            onClick={prev}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            data-testid="hero-next-btn"
            onClick={next}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dots */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {heroBanners.map((_, idx) => (
            <button
              key={idx}
              data-testid={`hero-dot-${idx}`}
              onClick={() => setCurrent(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === current
                  ? "w-6 h-2 bg-white"
                  : "w-2 h-2 bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
