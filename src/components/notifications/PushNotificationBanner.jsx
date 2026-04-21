import { useState } from "react";
import { Bell, BellRing, BellOff, Check, X, Smartphone } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/contexts/AuthContext";

export default function PushNotificationBanner() {
  const { user } = useAuth();
  const { supported, permission, subscription, subscribe, unsubscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Don't show if not supported, already subscribed, denied, or dismissed
  if (!supported || !user || permission === "denied" || dismissed) return null;

  // Already subscribed - show manage option
  if (subscription) return null;

  // Show the prompt banner
  if (permission === "default") {
    return (
      <div data-testid="push-banner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] flex items-center justify-center flex-shrink-0">
            <BellRing size={20} className="text-[#E05A33]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body font-semibold text-sm text-[#1A1A1A]">Bildirişləri aktivləşdirin</p>
            <p className="font-body text-xs text-[#8C8C8C] mt-0.5">Endirimlər və xüsusi təkliflərdən ilk siz xəbərdar olun</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              data-testid="push-enable-btn"
              onClick={async () => {
                setLoading(true);
                await subscribe();
                setLoading(false);
              }}
              disabled={loading}
              className="bg-[#E05A33] hover:bg-[#D94A22] text-white px-4 py-2 rounded-full font-body font-semibold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Bell size={13} />
              {loading ? "..." : "Aktivləşdir"}
            </button>
            <button
              data-testid="push-dismiss-btn"
              onClick={() => setDismissed(true)}
              className="p-2 rounded-full hover:bg-gray-50 text-[#8C8C8C]"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function PushNotificationToggle() {
  const { supported, permission, subscription, subscribe, unsubscribe } = usePushNotifications();
  const [loading, setLoading] = useState(false);

  if (!supported) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <BellOff size={18} className="text-[#8C8C8C]" />
        <div>
          <p className="font-body text-sm text-[#595959]">Push bildirişlər dəstəklənmir</p>
          <p className="font-body text-xs text-[#8C8C8C]">Bu brauzer push bildirişləri dəstəkləmir</p>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
        <BellOff size={18} className="text-red-400" />
        <div>
          <p className="font-body text-sm text-red-600">Bildirişlər bloklanıb</p>
          <p className="font-body text-xs text-red-400">Brauzer parametrlərindən icazə verin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-50">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${subscription ? "bg-green-50" : "bg-[#F5F3F0]"}`}>
          {subscription ? <BellRing size={18} className="text-green-600" /> : <Bell size={18} className="text-[#595959]" />}
        </div>
        <div>
          <p className="font-body font-semibold text-sm text-[#1A1A1A]">Push bildirişlər</p>
          <p className="font-body text-xs text-[#8C8C8C]">
            {subscription ? "Aktivdir - endirimlər haqqında xəbərdar olacaqsınız" : "Deaktiv - bildiriş almırsınız"}
          </p>
        </div>
      </div>
      <button
        data-testid="push-toggle-btn"
        onClick={async () => {
          setLoading(true);
          if (subscription) await unsubscribe();
          else await subscribe();
          setLoading(false);
        }}
        disabled={loading}
        className={`px-4 py-2 rounded-full font-body font-semibold text-xs transition-colors disabled:opacity-50 ${
          subscription
            ? "bg-gray-100 text-[#595959] hover:bg-gray-200"
            : "bg-[#E05A33] text-white hover:bg-[#D94A22]"
        }`}
      >
        {loading ? "..." : subscription ? "Söndür" : "Aktivləşdir"}
      </button>
    </div>
  );
}
