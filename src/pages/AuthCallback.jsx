import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function AuthCallback() {
  const navigate = useNavigate();
  const { googleCallback } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    const sessionId = hash.split("session_id=")[1]?.split("&")[0];

    if (!sessionId) {
      navigate("/", { replace: true });
      return;
    }

    const processAuth = async () => {
      try {
        const user = await googleCallback(sessionId);
        if (user.role === "admin" || user.role === "seller") {
          navigate("/admin", { replace: true, state: { user } });
        } else {
          navigate("/", { replace: true, state: { user } });
        }
      } catch (err) {
        console.error("Auth callback failed:", err);
        navigate("/login", { replace: true });
      }
    };

    processAuth();
  }, [navigate, googleCallback]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
