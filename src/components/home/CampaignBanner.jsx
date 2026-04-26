import { ArrowRight } from "lucide-react";

export default function CampaignBanner({ apiCampaigns }) {
  const campaigns = apiCampaigns?.length ? apiCampaigns : [];

  if (campaigns.length === 0) return null;

  return (
    <section data-testid="campaign-banners" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {campaigns.map((campaign) => (
          <button
            key={campaign.id}
            data-testid={`campaign-${campaign.id}`}
            className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 text-left transition-all duration-300 hover:shadow-lg group ${campaign.bgClass}`}
          >
            <div className="relative z-10">
              <span
                className={`inline-block text-xs font-body font-semibold mb-2 px-3 py-1 rounded-full ${
                  campaign.textColor === "text-white"
                    ? "bg-white/20 text-white"
                    : "bg-[#E05A33]/10 text-[#E05A33]"
                }`}
              >
                {campaign.subtitle}
              </span>
              <h3
                className={`font-heading font-bold text-xl sm:text-2xl mb-1.5 ${campaign.textColor}`}
              >
                {campaign.title}
              </h3>
              <p
                className={`font-body text-sm mb-4 ${
                  campaign.textColor === "text-white"
                    ? "text-white/70"
                    : "text-[#595959]"
                }`}
              >
                {campaign.description}
              </p>
              <span
                className={`inline-flex items-center gap-1.5 font-body font-semibold text-sm group-hover:gap-2.5 transition-all ${campaign.textColor}`}
              >
                {campaign.ctaText}{" "}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            </div>
            {/* Decorative shapes */}
            <div
              className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-10 ${
                campaign.textColor === "text-white" ? "bg-white" : "bg-[#E05A33]"
              }`}
            />
            <div
              className={`absolute right-12 -top-4 w-20 h-20 rounded-full opacity-5 ${
                campaign.textColor === "text-white" ? "bg-white" : "bg-[#E05A33]"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
