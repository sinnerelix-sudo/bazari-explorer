export function ProductJsonLd({ product }) {
  if (!product) return null;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.seo_description || "",
    image: product.images || [],
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: window.location.href,
      priceCurrency: "AZN",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Bazari" },
    },
    aggregateRating: product.rating > 0 ? {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.review_count || 1,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Bazari",
    url: window.location.origin,
    logo: `${window.location.origin}/bazari-logo.jpg`,
    description: "Premium marketplace - keyfiyyət və stil bir yerdə",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bakı",
      addressCountry: "AZ",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+994-12-345-67-89",
      contactType: "customer service",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url ? `${window.location.origin}${item.url}` : undefined,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
