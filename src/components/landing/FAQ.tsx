import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ = () => {
  const faqs = [
    {
      question: "How do the investment plans work?",
      answer: "Our investment plans use AI-powered automated trading strategies to trade cryptocurrencies on your behalf. You choose a plan based on your investment amount and risk tolerance, and our trading bot executes trades 24/7. Profits are calculated based on the performance of your chosen plan and are reflected in your account balance."
    },
    {
      question: "Is my investment secure?",
      answer: "Yes. We implement bank-level security measures including KYC verification, encrypted transactions, and cold storage for cryptocurrency holdings. Your funds are protected by multi-signature wallets, and we regularly conduct security audits. However, all cryptocurrency investments carry inherent market risks."
    },
    {
      question: "What are the minimum and maximum investment amounts?",
      answer: "Minimum investments start at $100 for the Starter Plan. Maximum amounts vary by plan: Starter ($999), Growth ($4,999), and Professional ($50,000). These limits ensure proper risk management and allow our trading algorithms to operate efficiently across different portfolio sizes."
    },
    {
      question: "How do I withdraw my funds?",
      answer: "You can request a withdrawal anytime from your dashboard. Navigate to the Withdraw section, enter the amount and your wallet address, and submit the request. Withdrawals are typically processed within 24-48 hours after admin approval. You'll receive a confirmation email once your withdrawal is processed."
    },
    {
      question: "What is the expected return on investment?",
      answer: "Expected ROI varies by plan: Starter (5-15%), Growth (10-25%), and Professional (15-40%). These are estimates based on historical performance and market conditions. Actual returns may be higher or lower and are never guaranteed. Cryptocurrency markets are volatile, and losses are possible."
    },
    {
      question: "Do I need KYC verification?",
      answer: "Yes, KYC (Know Your Customer) verification is required for all users. This is a regulatory requirement and helps protect your account from fraud. The verification process typically takes 24-48 hours and requires valid government-issued ID and proof of address."
    },
    {
      question: "How does the referral program work?",
      answer: "Invite friends using your unique referral link. When they sign up, make their first deposit, and start investing, you'll earn a referral bonus. The bonus amount depends on their initial investment. You can track your referrals and bonuses in the Referrals section of your dashboard."
    },
    {
      question: "Can I change my investment plan?",
      answer: "Yes, you can upgrade or change your investment plan at any time. Simply navigate to the Investments section, and select a new plan. Keep in mind that each plan has different minimum investment requirements and risk profiles. Contact support if you need assistance with plan changes."
    },
    {
      question: "What cryptocurrencies do you trade?",
      answer: "Our AI trading bot primarily focuses on major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), and other top-tier altcoins. The specific assets traded depend on market conditions and the strategy associated with your chosen investment plan. All deposits and withdrawals are processed in USDT."
    },
    {
      question: "How can I track my investment performance?",
      answer: "Your dashboard provides real-time tracking of your portfolio performance, including current balance, active investments, profit/loss, and transaction history. You'll also receive regular performance reports (monthly, weekly, or daily depending on your plan) with detailed analytics."
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Accordion type="single" collapsible className="w-full space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`}
            className="border border-border rounded-lg px-6 bg-card hover:shadow-elegant transition-all duration-300"
          >
            <AccordionTrigger className="text-left hover:text-primary">
              <span className="font-semibold">{faq.question}</span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
