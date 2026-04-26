import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div>
      <Header />
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Profil</h1>
        <p>Xoş gəldiniz, {user?.name}</p>
      </div>
      <MobileBottomNav />
    </div>
  );
}
