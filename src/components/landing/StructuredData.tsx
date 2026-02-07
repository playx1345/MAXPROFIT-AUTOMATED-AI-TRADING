import { memo } from "react";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Live Win Trade Investment",
  "url": "https://livewintradeiv.com",
  "logo": "https://livewintradeiv.com/pwa-512x512.png",
  "description": "AI-powered cryptocurrency investment platform with automated trading strategies.",
  "foundingDate": "2024",
  "sameAs": [],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "availableLanguage": ["English", "Arabic", "Korean", "Romanian", "Russian", "Ukrainian"]
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Live Win Trade Investment",
  "url": "https://livewintradeiv.com",
  "description": "Professional cryptocurrency investment platform with AI-powered automated trading strategies.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://livewintradeiv.com/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do the investment plans work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our investment plans use AI-powered automated trading strategies to trade cryptocurrencies on your behalf. You choose a plan based on your investment amount and risk tolerance, and our trading bot executes trades 24/7."
      }
    },
    {
      "@type": "Question",
      "name": "Is my investment secure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. We implement bank-level security measures including KYC verification, encrypted transactions, and cold storage for cryptocurrency holdings. Your funds are protected by multi-signature wallets."
      }
    },
    {
      "@type": "Question",
      "name": "What are the minimum and maximum investment amounts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Minimum investments start at $100 for the Starter Plan. Maximum amounts vary by plan: Starter ($999), Growth ($4,999), and Professional ($50,000)."
      }
    },
    {
      "@type": "Question",
      "name": "How do I withdraw my funds?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can request a withdrawal anytime from your dashboard. Withdrawals are typically processed within 24-48 hours after admin approval."
      }
    },
    {
      "@type": "Question",
      "name": "What is the expected return on investment?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Expected ROI varies by plan: Starter (5-15%), Growth (10-25%), and Professional (15-40%). These are estimates based on historical performance. Actual returns may vary and are never guaranteed."
      }
    },
    {
      "@type": "Question",
      "name": "What cryptocurrencies do you trade?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our AI trading bot primarily focuses on major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), and other top-tier altcoins. All deposits and withdrawals are processed in USDT."
      }
    }
  ]
};

const investmentProductSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "Live Win Trade AI Investment Plans",
  "description": "AI-powered cryptocurrency trading plans with automated strategies for different risk profiles.",
  "provider": {
    "@type": "Organization",
    "name": "Live Win Trade Investment"
  },
  "category": "Cryptocurrency Investment",
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter Plan",
      "description": "Conservative trading strategies for beginners. $100-$999 investment range.",
      "priceCurrency": "USD",
      "price": "100",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": "100",
        "maxPrice": "999",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "Offer",
      "name": "Growth Plan",
      "description": "Balanced risk/reward with multiple trading strategies. $1,000-$4,999 investment range.",
      "priceCurrency": "USD",
      "price": "1000",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": "1000",
        "maxPrice": "4999",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "Offer",
      "name": "Professional Plan",
      "description": "Aggressive strategies with maximum potential returns. $5,000-$50,000 investment range.",
      "priceCurrency": "USD",
      "price": "5000",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": "5000",
        "maxPrice": "50000",
        "priceCurrency": "USD"
      }
    }
  ]
};

export const StructuredData = memo(() => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(investmentProductSchema) }}
      />
    </>
  );
});

StructuredData.displayName = "StructuredData";
