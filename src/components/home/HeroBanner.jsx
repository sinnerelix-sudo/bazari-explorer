import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroBanner({ banners = [] }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState("");
  const dragStartRef = useRef(null);
  const total = banners.length;

  const goTo = useCallback(
    (index) => {
      if (total === 0) return;
      setCurrent((index + total) % total);
      setFeedback("");
    },
    [total]
  );

  const next = useCallback(() => {
    goTo(current + 1);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo(current - 1);
  }, [current, goTo]);

  useEffect(() => {
    if (total <= 1) return undefined;
    const banner = banners[current] || banners[0];
    const duration = Math.max(Number(banner?.duration_ms || banner?.duration_seconds * 1000 || 5000), 1000);
    const timer = window.setTimeout(next, duration);
    return () => window.clearTimeout(timer);
  }, [banners, current, next, total]);

  useEffect(() => {
    if (current >= total) setCurrent(0);
  }, [current, total]);

  if (total === 0) return null;

  const banner = banners[current] || banners[0];
  const duration = Math.max(Number(banner?.duration_ms || banner?.duration_seconds * 1000 || 5000), 1000);
  const ctaText = (banner.cta_text || banner.cta || "").trim();
  const actionType = banner.action_type || "none";
  const actionValue = (banner.action_value || banner.url || "").trim();

  const handlePointerDown = (event) => {
    dragStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerUp = (event) => {
    const start = dragStartRef.current;
    dragStartRef.current = null;
    if (!start) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy)) return;

    if (dx < 0) next();
    else prev();
  };

  const copyCoupon = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement("textarea");
      input.value = value;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setFeedback("Kupon kopyalandı");
    window.setTimeout(() => setFeedback(""), 1800);
  };

  const handleCtaClick = async () => {
    if (!ctaText || !actionValue || actionType === "none") return;

    if (actionType === "coupon") {
      await copyCoupon(actionValue);
      return;
    }

    if (actionType === "external") {
      window.location.href = actionValue;
      return;
    }

    navigate(actionValue);
  };

  return (
    <section data-testid="hero-banner" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-4 sm:mt-6">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
        <div
          className="relative aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden touch-pan-y select-none"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            dragStartRef.current = null;
          }}
        >
          {banners.map((b, idx) => (
            <div
              key={b.id || idx}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === current ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={b.image}
                alt={b.title || "Bazari hero banner"}
                className="w-full h-full object-cover"
                loading={idx === 0 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
            </div>
          ))}

          <div className="absolute inset-0 flex items-center pb-8 sm:pb-0 px-6 sm:px-12 lg:px-16">
            <div className="max-w-md">
              <span className="inline-block text-white/80 text-xs sm:text-sm font-body font-medium mb-2 tracking-wide uppercase">
                {banner.eyebrow || "Xüsusi təklif"}
              </span>
              <h2 className="font-heading font-bold text-2xl sm:text-4xl lg:text-5xl text-white mb-2 sm:mb-3 leading-tight">
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="text-white/90 font-body text-base sm:text-lg font-medium mb-4 sm:mb-6">
                  {banner.subtitle}
                </p>
              )}
              {ctaText && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    data-testid="hero-cta-btn"
                    onClick={handleCtaClick}
                    className="bg-[#E05A33] hover:bg-[#D94A22] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-body font-semibold text-sm sm:text-base transition-all duration-200 hover:shadow-lg hover:shadow-[#E05A33]/20 active:scale-[0.98]"
                  >
                    {ctaText}
                  </button>
                  {feedback && (
                    <span data-testid="hero-cta-feedback" className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-body font-semibold text-white backdrop-blur">
                      {feedback}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {total > 1 && (
            <>
              <button
                type="button"
                data-testid="hero-prev-btn"
                onClick={prev}
                className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white transition-all"
                aria-label="Əvvəlki banner"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                data-testid="hero-next-btn"
                onClick={next}
                className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white transition-all"
                aria-label="Növbəti banner"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {total > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {banners.map((_, idx) => (
              <button
                type="button"
                key={idx}
                data-testid={`hero-dot-${idx}`}
                onClick={() => goTo(idx)}
                className="h-2 w-8 overflow-hidden rounded-full bg-white/40"
                aria-label={`${idx + 1}. banner`}
              >
                <span
                  className={`block h-full rounded-full bg-white transition-[width] ease-linear ${
                    idx === current ? "w-full" : "w-0"
                  }`}
                  style={idx === current ? { transitionDuration: `${duration}ms` } : undefined}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
