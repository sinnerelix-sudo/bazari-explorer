import { useState, useEffect, useRef } from "react";
import { Bell, X, Check } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

import { API_BASE as API } from "@/lib/api";

export default function NotificationPanel() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const { data } = await axios.get(`${API}/notifications/unread-count`, { withCredentials: true });
        setUnread(data.count);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadNotifications = async () => {
    try {
      const { data } = await axios.get(`${API}/notifications`, { withCredentials: true });
      setNotifications(data);
    } catch {}
  };

  const handleOpen = () => {
    setOpen(!open);
    if (!open) loadNotifications();
  };

  const markRead = async (id) => {
    try {
      await axios.post(`${API}/notifications/read/${id}`, {}, { withCredentials: true });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
      setUnread((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await axios.post(`${API}/notifications/read-all`, {}, { withCredentials: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    } catch {}
  };

  const typeColors = {
    info: "bg-blue-50 text-blue-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-amber-50 text-amber-600",
    deal: "bg-[#FFF0E6] text-[#E05A33]",
  };

  return (
    <div ref={ref} className="relative">
      <button
        data-testid="notifications-btn"
        onClick={handleOpen}
        className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors relative"
      >
        <Bell size={20} className="text-[#595959]" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#E05A33] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div data-testid="notification-panel" className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h3 className="font-heading font-bold text-sm text-[#1A1A1A]">Bildirişlər</h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs font-body text-[#E05A33] hover:underline flex items-center gap-1">
                  <Check size={12} /> Hamısını oxu
                </button>
              )}
              <button onClick={() => setOpen(false)}>
                <X size={16} className="text-[#8C8C8C]" />
              </button>
            </div>
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center font-body text-sm text-[#8C8C8C]">Bildiriş yoxdur</div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.is_read ? "bg-[#FDFCFB]" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? "bg-[#E05A33]" : "bg-transparent"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${typeColors[n.type] || typeColors.info}`}>{n.type}</span>
                        <span className="font-body text-[10px] text-[#8C8C8C]">
                          {new Date(n.created_at).toLocaleDateString("az-AZ")}
                        </span>
                      </div>
                      <p className="font-body font-semibold text-sm text-[#1A1A1A] mt-1">{n.title}</p>
                      <p className="font-body text-xs text-[#595959] mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
