import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, User, Phone, Check } from "lucide-react";
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
  
  const [otpLoading, setOtpLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isWaitingForWhatsApp, setIsWaitingForWhatsApp] = useState(false);

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

  const handleGenerateCode = async () => {
    if (!phone) {
      setError("Zəhmət olmasa WhatsApp nömrənizi daxil edin");
      return;
    }
    setOtpLoading(true);
    setError("");
    try {
      const { data } = await api.post("otp/generate", { phone });
      setGeneratedCode(data.code);
      setIsOtpSent(true);
      setIsWaitingForWhatsApp(true);
    } catch (err) {
      setError(formatApiError(err.response?.data, "Kod yaradılmadı"));
    } finally {
      setOtpLoading(false);
    }
  };

  // Polling for verification status
  useEffect(() => {
    let interval;
    if (isWaitingForWhatsApp && phone) {
      interval = setInterval(async () => {
        try {
          const { data } = await api.get(`otp/check-status?phone=${phone}`);
          if (data.verified) {
            setIsOtpVerified(true);
            setIsWaitingForWhatsApp(false);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Status check failed", err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isWaitingForWhatsApp, phone]);

  const handleWhatsAppRedirect = () => {
    const businessPhone = "15556344242"; 
    const message = encodeURIComponent(generatedCode);
    window.open(`https://wa.me/${businessPhone}?text=${message}`, '_blank');
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
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <BrandMark className="w-10 h-10 rounded-xl" />
          <span className="font-heading font-bold text-2xl text-[#1A1A1A]">Bazari</span>
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <h1 className="font-heading font-bold text-xl text-[#1A1A1A] mb-1 text-center">
            {isRegister ? "Qeydiyyat" : "Daxil ol"}
          </h1>
          <p className="font-body text-sm text-[#8C8C8C] mb-6 text-center">
            {isRegister ? "Yeni hesab yarat" : "Hesabına daxil ol"}
          </p>

          {error && (
            <div data-testid="auth-error" className="bg-red-50 text-red-600 text-sm font-body p-3 rounded-xl mb-4 text-center">
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
                <div className="relative flex flex-col gap-3">
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
                    <input
                      data-testid="register-phone"
                      type="tel"
                      placeholder="WhatsApp nömrəniz"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setIsOtpVerified(false); setIsOtpSent(false); }}
                      disabled={isOtpVerified || isOtpSent}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm transition-all disabled:opacity-60"
                    />
                  </div>
                  
                  {!isOtpSent && !isOtpVerified && (
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      disabled={otpLoading || !phone}
                      className="w-full py-3 rounded-xl bg-[#1A1A1A] text-white font-body font-semibold text-sm hover:bg-black transition-all disabled:opacity-50"
                    >
                      {otpLoading ? "Gözləyin..." : "Təsdiq kodu yarat"}
                    </button>
                  )}

                  {isOtpSent && !isOtpVerified && (
                    <div className="bg-[#FFF7F2] border border-[#E05A33]/20 p-4 rounded-2xl animate-in fade-in zoom-in duration-300">
                       <p className="font-body text-xs text-[#595959] text-center mb-3 text-left">
                         Nömrənizi təsdiqləmək üçün aşağıdakı düyməni sıxıb WhatsApp-da mesajı göndərin.
                       </p>
                       <div className="bg-white py-3 rounded-xl border-2 border-dashed border-[#E05A33]/30 text-center mb-4">
                         <span className="font-heading font-bold text-xl text-[#E05A33] tracking-widest">{generatedCode}</span>
                       </div>
                       <button
                         type="button"
                         onClick={handleWhatsAppRedirect}
                         className="w-full py-3.5 bg-[#25D366] text-white rounded-full font-body font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#20bd5c] shadow-lg shadow-[#25D366]/20 transition-all"
                       >
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.128.571-.075 1.758-.716 2.003-1.408.245-.693.245-1.287.172-1.408-.074-.122-.272-.196-.57-.346z"/>
                         </svg>
                         WhatsApp ilə göndər
                       </button>
                       <p className="text-[10px] text-[#8C8C8C] text-center mt-3 animate-pulse">
                         WhatsApp-da mesajı göndərdikdən sonra buranı bağlamayın...
                       </p>
                    </div>
                  )}

                  {isOtpVerified && (
                    <div className="w-full py-4 bg-green-50 text-green-600 rounded-2xl font-body font-bold text-sm flex items-center justify-center gap-2 border border-green-100">
                      <Check size={20} /> Nömrəniz təsdiqləndi!
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-[#E05A33] font-body bg-[#FFF0E6] p-2 rounded-lg">
                   <b>Diqqət:</b> Sadəcə WhatsApp nömrənizi qeyd edin. Təsdiqləmə üçün butona basıb WhatsApp-da mesajı göndərin.
                </p>
              </div>
            )}

            <button
              data-testid="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#E05A33] hover:bg-[#D94A22] text-white py-3.5 rounded-full font-body font-semibold text-sm transition-all disabled:opacity-50 mt-2"
            >
              {loading ? "Gözləyin..." : isRegister ? "Qeydiyyatdan keç" : "Daxil ol"}
            </button>
          </form>

          <p className="text-center mt-6 font-body text-sm text-[#8C8C8C]">
            {isRegister ? "Artıq hesabın var?" : "Hesabın yoxdur?"}{" "}
            <button
              data-testid="toggle-auth-mode"
              onClick={() => { setIsRegister(!isRegister); setError(""); setIsOtpSent(false); setIsOtpVerified(false); }}
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
