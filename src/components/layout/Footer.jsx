import { MapPin, Mail, ChevronRight } from "lucide-react";
import BrandMark from "./BrandMark";

const footerLinks = [
  {
    title: "Müştəri xidməti",
    links: ["Çatdırılma", "Geri qaytarma", "FAQ", "Ölçü cədvəli", "Əlaqə"],
  },
  {
    title: "Şirkət",
    links: ["Haqqımızda", "Karyera", "Bloq", "Tərəfdaşlıq", "Mağazalar"],
  },
];

export default function Footer() {
  return (
    <footer
      data-testid="main-footer"
      className="bg-[#1A1A1A] text-white mt-12 pb-24 md:pb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <BrandMark className="w-8 h-8 rounded-xl" />
              <span className="font-heading font-bold text-lg">Bazari</span>
            </div>
            <p className="text-sm text-gray-400 font-body leading-relaxed mb-4">
              {"Premium marketplace - keyfiyyət və stil bir yerdə."}
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin size={14} className="flex-shrink-0" />
                <span className="font-body">{"Bakı, Azərbaycan"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail size={14} className="flex-shrink-0" />
                <span className="font-body">info@bazari.site</span>
              </div>
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-heading font-semibold text-sm mb-4 text-gray-200">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 font-body hover:text-white transition-colors flex items-center gap-1 group"
                    >
                      <ChevronRight
                        size={12}
                        className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200"
                      />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-body">
            {"2025 Bazari. Bütün hüquqlar qorunur."}
          </p>
          <div className="flex items-center gap-4">
            {["Visa", "MC", "GPay"].map((pm) => (
              <div
                key={pm}
                className="px-3 py-1.5 bg-gray-800 rounded-md text-[10px] font-body font-medium text-gray-400"
              >
                {pm}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
