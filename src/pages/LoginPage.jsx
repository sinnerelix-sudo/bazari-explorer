import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import BrandMark from "@/components/layout/BrandMark";

function formatApiError(payload, fallbackMessage) {
  const detail = payload?.detail ?? payload?.error ?? payload;
  if (detail == null) return "Xəta baş verdi. Yenidən cəhd edin.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const { user, login, register, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin" || user.role === "seller") {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    }
  }, [user, authLoading, navigate]);
  
  const handleSendOtp = async () => {
    if (!phone) {
      setError("Zəhmət olmasa WhatsApp nömrənizi daxil edin");
      return;
    }
    setOtpLoading(true);
    setError("");
    try {
      await api.post("/otp/send", { phone });
      setIsOtpSent(true);
    } catch (err) {
      setError(formatApiError(err.response?.data, "Kod göndərilmədi"));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setOtpLoading(true);
    setError("");
    try {
      await api.post("/otp/verify", { phone, code: otp });
      setIsOtpVerified(true);
    } catch (err) {
      setError(formatApiError(err.response?.data, "Kod yanlışdır"));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      
      if (isRegister) {
        if (!isOtpVerified) {
          setError("Zəhmət olmasa nömrənizi WhatsApp ilə təsdiqləyin");
          setLoading(false);
          return;
        }

        const user = await register(name, email, password, phone);
        if (user.role === "admin" || user.role === "seller") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        const user = await login(email, password);
        if (user.role === "admin" || user.role === "seller") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      setError(formatApiError(err.response?.data, err.message));
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div data-testid="login-page" className="min-h-screen bg-[#FDFCFB] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <BrandMark className="w-10 h-10 rounded-xl" />
            <span className="font-heading font-bold text-2xl text-[#1A1A1A]">Bazari</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <h1 className="font-heading font-bold text-xl text-[#1A1A1A] mb-1 text-center">
            {isRegister ? "Qeydiyyat" : "Daxil ol"}
          </h1>
          <p className="font-body text-sm text-[#8C8C8C] mb-6 text-center">
            {isRegister ? "Yeni hesab yarat" : "Hesabına daxil ol"}
          </p>

          {error && (
            <div data-testid="auth-error" className="bg-red-50 text-red-600 text-sm font-body p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
                <input
                  data-testid="register-name"
                  type="text"
                  placeholder="Ad Soyad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
              <input
                data-testid="login-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm transition-all"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
              <input
                data-testid="login-password"
                type={showPass ? "text" : "password"}
                placeholder="Parol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm transition-all"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {isRegister && (
              <div className="space-y-3">
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
                    <input
                      data-testid="register-phone"
                      type="tel"
                      placeholder="WhatsApp nömrəsi"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setIsOtpVerified(false); setIsOtpSent(false); }}
                      disabled={isOtpVerified}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm transition-all disabled:opacity-60"
                    />
                  </div>
                  {!isOtpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading || !phone}
                      className="px-4 py-3 rounded-xl bg-[#1A1A1A] text-white font-body font-semibold text-xs hover:bg-black transition-all disabled:opacity-50"
                    >
                      {otpLoading ? "..." : isOtpSent ? "Yenidən" : "Kodu al"}
                    </button>
                  )}
                  {isOtpVerified && (
                    <div className="px-4 py-3 rounded-xl bg-green-50 text-green-600 font-body font-bold text-xs flex items-center gap-1">
                      Təsdiqləndi
                    </div>
                  )}
                </div>
                
                <p className="text-[10px] text-[#E05A33] font-body bg-[#FFF0E6] p-2 rounded-lg">
                   Sadəcə <b>WhatsApp</b> nömrənizi qeyd edin. Təsdiq kodu WhatsApp-a göndəriləcək.
                </p>

                {isOtpSent && !isOtpVerified && (
                  <div className="relative flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative flex-1">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
                      <input
                        type="text"
                        placeholder="6 rəqəmli kod"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpLoading || otp.length < 6}
                      className="px-4 py-3 rounded-xl bg-[#E05A33] text-white font-body font-semibold text-xs hover:bg-[#D94A22] transition-all disabled:opacity-50"
                    >
                      {otpLoading ? "..." : "Təsdiqlə"}
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              data-testid="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#E05A33] hover:bg-[#D94A22] text-white py-3 rounded-full font-body font-semibold text-sm transition-all disabled:opacity-50"
            >
              {loading ? "Gözləyin..." : isRegister ? "Qeydiyyatdan keç" : "Daxil ol"}
            </button>
          </form>



          <p className="text-center mt-5 font-body text-sm text-[#8C8C8C]">
            {isRegister ? "Artıq hesabın var?" : "Hesabın yoxdur?"}{" "}
            <button
              data-testid="toggle-auth-mode"
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
              className="text-[#E05A33] font-semibold hover:underline"
            >
              {isRegister ? "Daxil ol" : "Qeydiyyat"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
