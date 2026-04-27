import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Download, Copy, Check, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function BonusPanel({ open, onOpenChange, product }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMedia = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Yükləmə başladı");
    } catch (error) {
      console.error("Download failed", error);
      toast.error("Yükləmə uğursuz oldu");
    }
  };

  if (!product) return null;

  const allMedia = [
    ...(product.images || []).map(url => ({ url, type: 'image' })),
    ...(product.videos || []).map(url => ({ url, type: 'video' }))
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-[80vh] rounded-t-[32px] bg-[#FDFCFB] p-0 border-none overflow-hidden flex flex-col">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />
        
        <SheetHeader className="px-6 pb-4">
          <SheetTitle className="font-heading font-bold text-xl text-[#1A1A1A]">Məhsulu sat və qazan</SheetTitle>
          <SheetDescription className="font-body text-sm text-[#595959] leading-relaxed flex items-start gap-2 bg-[#F5F3F0] p-4 rounded-2xl mt-2 text-left">
            <Info size={18} className="text-[#E05A33] mt-0.5 flex-shrink-0" />
            <span>Məhsul linkini paylaş, link vasitəsilə verilən sifarişin bonusunu 14-17 gün ərzində əldə et.</span>
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-24">
          {/* Bonus Info */}
          <div className="bg-[#FFF0E6] border border-[#E05A33]/20 p-6 rounded-3xl text-center">
            <p className="font-body text-sm text-[#595959] mb-1">{product.name}</p>
            <div className="flex flex-col items-center">
              <span className="font-body text-[#8C8C8C] text-xs uppercase tracking-wider font-bold">Satış bonusu</span>
              <span className="font-heading font-bold text-4xl text-[#E05A33] mt-1">{product.bonus_amount || 0} ₼</span>
            </div>
            
            <button 
              onClick={handleCopyLink}
              className="w-full mt-6 py-4 bg-[#E05A33] text-white rounded-full font-body font-semibold flex items-center justify-center gap-2 hover:bg-[#D94A22] transition-colors shadow-lg shadow-[#E05A33]/20"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? "Link kopyalandı" : "Satış linkini kopyala"}
            </button>
          </div>

          {/* Media Section */}
          <div>
            <h3 className="font-heading font-bold text-lg text-[#1A1A1A] mb-4">Şəkil və Videolar</h3>
            <div className="grid grid-cols-2 gap-4">
              {allMedia.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-[#F5F3F0] relative group">
                    {item.type === 'image' ? (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <video src={item.url} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <button 
                    onClick={() => downloadMedia(item.url, `product-${product.id}-${idx}`)}
                    className="w-full py-2.5 rounded-xl border border-gray-200 font-body font-medium text-xs flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <Download size={14} />
                    Yüklə
                  </button>
                </div>
              ))}
              {allMedia.length === 0 && (
                <p className="col-span-2 text-center py-8 font-body text-[#8C8C8C]">Media tapılmadı</p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
