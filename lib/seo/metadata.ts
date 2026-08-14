import { Metadata } from "next";
import { ToolItem } from "@/data/tools";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pixelforge.tools";
const SITE_NAME = "PixelForge";

export function generateToolMetadata(tool: ToolItem): Metadata {
  const url = `${SITE_URL}/tools/${tool.slug}`;
  const title = `${tool.name} — Free Online Tool | ${SITE_NAME}`;
  const description = tool.metaDescription || tool.description;

  return {
    title,
    description,
    keywords: [...tool.tags, "free online tool", "browser based", "no upload", "privacy first"],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${tool.name} - PixelForge`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}

export function generateToolJsonLd(tool: ToolItem) {
  const url = `${SITE_URL}/tools/${tool.slug}`;

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    operatingSystem: "All",
    applicationCategory: tool.category === "image" ? "MultimediaApplication" : "UtilitiesApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: tool.description,
    url,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tool.category === "image" ? "Image Tools" : "PDF Tools",
        item: `${SITE_URL}/${tool.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: url,
      },
    ],
  };

  const faqSchema =
    tool.faqs && tool.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: tool.faqs?.map((faq: any) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return {
    softwareSchema,
    breadcrumbSchema,
    faqSchema,
  };
}
