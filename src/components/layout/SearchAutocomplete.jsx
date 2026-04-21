import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import axios from "axios";

import { API_BASE as API } from "@/lib/api";

export default function SearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API}/search/autocomplete?q=${encodeURIComponent(query)}`);
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const close = () => { setFocused(false); setQuery(""); setResults(null); };

  const hasResults = results && (results.products?.length > 0 || results.categories?.length > 0);

  return (
    <div ref={ref} className="relative flex-1 max-w-xl mx-4 sm:mx-8">
      <div
        data-testid="search-bar"
        className={`flex items-center gap-2 rounded-full px-4 py-2.5 transition-all duration-200 ${
          focused ? "bg-white border-[#E05A33] border shadow-sm" : "bg-[#F5F3F0] border border-transparent"
        }`}
      >
        <Search size={18} className="text-[#8C8C8C] flex-shrink-0" />
        <input
          data-testid="search-input"
          type="text"
          placeholder="Məhsul axtar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          className="bg-transparent outline-none w-full text-sm font-body text-[#1A1A1A] placeholder:text-[#8C8C8C]"
        />
        {query && (
          <button onClick={close} className="text-[#8C8C8C] hover:text-[#1A1A1A]">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {focused && query.length >= 2 && (
        <div data-testid="search-dropdown" className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-gray-100 shadow-lg z-50 overflow-hidden max-h-[400px] overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-center">
              <div className="w-5 h-5 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}
          {!loading && !hasResults && (
            <div className="px-4 py-6 text-center font-body text-sm text-[#8C8C8C]">
              Nəticə tapılmadı
            </div>
          )}
          {!loading && hasResults && (
            <>
              {results.categories?.length > 0 && (
                <div className="px-4 pt-3 pb-1">
                  <span className="font-body text-[10px] text-[#8C8C8C] uppercase tracking-wider font-semibold">Kateqoriyalar</span>
                  {results.categories.map((c) => (
                    <Link key={c.id} to={`/category/${c.slug}`} onClick={close} className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded-lg px-1 -mx-1 transition-colors">
                      {c.image && <img src={c.image} alt="" className="w-8 h-8 rounded-lg object-cover" />}
                      <span className="font-body text-sm text-[#1A1A1A] font-medium">{c.name}</span>
                    </Link>
                  ))}
                </div>
              )}
              {results.products?.length > 0 && (
                <div className="px-4 pt-2 pb-3 border-t border-gray-50">
                  <span className="font-body text-[10px] text-[#8C8C8C] uppercase tracking-wider font-semibold">Məhsullar</span>
                  {results.products.map((p) => (
                    <Link key={p.id} to={`/product/${p.id}`} onClick={close} className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded-lg px-1 -mx-1 transition-colors">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-[#F5F3F0]" />}
                      <div className="flex-1 min-w-0">
                        <span className="font-body text-sm text-[#1A1A1A] line-clamp-1">{p.name}</span>
                        <span className="font-heading font-bold text-xs text-[#E05A33]">{p.price} ₼</span>
                      </div>
                      {p.discount > 0 && (
                        <span className="text-[10px] font-bold text-[#E05A33] bg-[#FFF0E6] px-1.5 py-0.5 rounded">-{p.discount}%</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
