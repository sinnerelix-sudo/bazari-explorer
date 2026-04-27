import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { LogIn, UserPlus, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GuestBonusPanel({ open, onOpenChange }) {
  const navigate = useNavigate();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[40vh] sm:h-[35vh] rounded-t-[32px] bg-[#FDFCFB] p-0 border-none overflow-hidden flex flex-col">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />
        
        <SheetHeader className="px-6 pb-6 pt-2">
          <SheetTitle className="font-heading font-bold text-xl text-[#1A1A1A] text-center">Bonus Sistemi</SheetTitle>
          <div className="flex flex-col items-center gap-3 mt-4">
            <div className="w-12 h-12 bg-[#FFF0E6] rounded-full flex items-center justify-center text-[#E05A33]">
              <Info size={24} />
            </div>
            <p className="font-body text-base text-[#595959] text-center font-medium">
              Bonus sistemi yalnız istifadəçilər üçün mövcuddur
            </p>
          </div>
        </SheetHeader>

        <div className="px-6 flex gap-3 pb-8">
          <button 
            onClick={() => navigate('/login')}
            className="flex-1 py-4 bg-[#F5F3F0] text-[#1A1A1A] rounded-full font-body font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <LogIn size={20} />
            Giriş
          </button>
          <button 
            onClick={() => navigate('/login?mode=register')}
            className="flex-1 py-4 bg-[#E05A33] text-white rounded-full font-body font-semibold flex items-center justify-center gap-2 hover:bg-[#D94A22] transition-colors shadow-lg shadow-[#E05A33]/20"
          >
            <UserPlus size={20} />
            Qeydiyyat
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
