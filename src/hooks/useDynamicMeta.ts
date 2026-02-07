import { useEffect } from "react";

interface DynamicMetaProps {
  title?: string;
  description?: string;
  page?: string;
  ogImageUrl?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SITE_URL = "https://livewintradeiv.com";

/**
 * Hook to dynamically update meta tags for SEO and social sharing.
 * Sets og:image to the dynamic OG generation endpoint with caching.
 */
export function useDynamicMeta({
  title,
  description,
  page = "home",
  ogImageUrl,
}: DynamicMetaProps) {
  useEffect(() => {
    // Build the dynamic OG image URL
    const ogUrl =
      ogImageUrl ||
      `${SUPABASE_URL}/functions/v1/generate-og-image?page=${encodeURIComponent(page)}${
        title ? `&title=${encodeURIComponent(title)}` : ""
      }`;

    const fullTitle = title
      ? `${title} | Live Win Trade`
      : "Live Win Trade – AI Crypto Investment Platform";

    const fullDescription =
      description ||
      "Invest in crypto with AI-powered automated trading. Secure, transparent platform with plans starting at $100.";

    // Update document title
    document.title = fullTitle;

    // Helper to set or create a meta tag
    const setMeta = (attr: string, key: string, value: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    // Standard meta
    setMeta("name", "title", fullTitle);
    setMeta("name", "description", fullDescription);

    // Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", fullDescription);
    setMeta("property", "og:image", ogUrl);
    setMeta("property", "og:url", `${SITE_URL}/${page === "home" ? "" : page}`);

    // Twitter
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", fullDescription);
    setMeta("name", "twitter:image", ogUrl);

    // Cleanup - restore defaults on unmount
    return () => {
      document.title = "Live Win Trade – AI Crypto Investment Platform";
    };
  }, [title, description, page, ogImageUrl]);
}
