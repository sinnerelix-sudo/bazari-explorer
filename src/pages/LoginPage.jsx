import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import BrandMark from "@/components/layout/BrandMark";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        const u = await register(name, email, password, phone);
        if (u.role === "admin" || u.role === "seller") navigate("/admin");
        else navigate("/");
      } else {
        const u = await login(email, password);
        if (u.role === "admin" || u.role === "seller") navigate("/admin");
        else navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <BrandMark className="w-10 h-10 rounded-xl" />
          <span className="font-heading font-bold text-2xl text-[#1A1A1A]">Bazari</span>
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm text-center">
          <h1 className="font-heading font-bold text-xl text-[#1A1A1A] mb-1">
            {isRegister ? "Qeydiyyat" : "Daxil ol"}
          </h1>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <input
                type="text"
                placeholder="Ad Soyad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#F5F3F0]"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-[#F5F3F0]"
            />
            <input
              type="password"
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-[#F5F3F0]"
            />
            <button type="submit" disabled={loading} className="w-full bg-[#E05A33] text-white py-3 rounded-full">
              {loading ? "..." : isRegister ? "Qeydiyyat" : "Daxil ol"}
            </button>
          </form>
          <button onClick={() => setIsRegister(!isRegister)} className="mt-4 text-[#E05A33]">
            {isRegister ? "Daxil ol" : "Qeydiyyat"}
          </button>
        </div>
      </div>
    </div>
  );
}
