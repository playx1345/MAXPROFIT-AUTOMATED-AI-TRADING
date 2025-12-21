// Platform contact emails
export const PLATFORM_EMAILS = {
  admin: 'admin@win-tradex.com',
  live: 'live@win-tradex.com',
  support: 'support@win-tradex.com',
} as const;

// Automated chat responses for common queries
export const AUTOMATED_RESPONSES: { keywords: string[]; response: string; responseKey: string }[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
    response: "Hello! 👋 Welcome to Win Trade Invest support. How can I help you today?",
    responseKey: 'greeting'
  },
  {
    keywords: ['withdraw', 'withdrawal', 'cash out', 'take out money'],
    response: "For withdrawals:\n\n1. Go to Dashboard → Withdraw\n2. Enter amount and wallet address\n3. Pay the 10% confirmation fee\n4. Withdrawals are processed within 24 hours\n\nMinimum withdrawal: $50\n\nNeed more help? Email us at support@win-tradex.com",
    responseKey: 'withdrawal'
  },
  {
    keywords: ['deposit', 'add money', 'fund', 'top up'],
    response: "To make a deposit:\n\n1. Go to Dashboard → Deposit\n2. Choose USDT (TRC20) or BTC\n3. Send crypto to the provided wallet address\n4. Submit deposit request with transaction hash\n\nMinimum deposit: $250\n\nDeposits are processed within 24 hours after blockchain confirmation.",
    responseKey: 'deposit'
  },
  {
    keywords: ['invest', 'investment', 'plan', 'trading', 'returns', 'roi'],
    response: "We offer 3 investment plans:\n\n📈 Starter: $250-$4,999 (5-8% ROI)\n📊 Growth: $5,000-$24,999 (8-12% ROI)\n💎 Professional: $25,000-$100,000 (12-18% ROI)\n\nAll plans run for 30 days with our AI trading bot.\n\nGo to Dashboard → Investments to get started!",
    responseKey: 'investment'
  },
  {
    keywords: ['kyc', 'verify', 'verification', 'identity', 'id card', 'passport'],
    response: "KYC Verification:\n\n1. Go to Profile & KYC\n2. Fill in your personal details\n3. Upload a government-issued ID\n4. Submit for verification\n\nNote: A $400 verification fee applies upon approval.\n\nVerification takes 24-48 hours.",
    responseKey: 'kyc'
  },
  {
    keywords: ['fee', 'confirmation fee', 'blockchain fee', 'charges'],
    response: "Platform Fees:\n\n• KYC Verification: $400 (one-time)\n• Withdrawal Confirmation: 10% of withdrawal amount\n• Platform Fee: 20% of profits\n\nAll fees are clearly shown before any transaction.",
    responseKey: 'fees'
  },
  {
    keywords: ['contact', 'email', 'support', 'help', 'assistance'],
    response: "Contact us:\n\n📧 General Support: support@win-tradex.com\n📧 Live Support: live@win-tradex.com\n📧 Admin: admin@win-tradex.com\n\nOur team typically responds within 24 hours.",
    responseKey: 'contact'
  },
  {
    keywords: ['problem', 'issue', 'error', 'not working', 'bug', 'failed'],
    response: "Sorry to hear you're having issues. Please:\n\n1. Try refreshing the page\n2. Clear your browser cache\n3. Check your internet connection\n\nIf the problem persists, email us at support@win-tradex.com with:\n• Your account email\n• Description of the issue\n• Screenshots if possible",
    responseKey: 'problem'
  },
  {
    keywords: ['account', 'login', 'password', 'sign in', 'access'],
    response: "Account issues:\n\n• Forgot password? Use 'Forgot Password' on login page\n• Account locked? Contact support@win-tradex.com\n• Can't login? Clear browser cookies and try again\n\nNeed more help? We're here for you!",
    responseKey: 'account'
  },
  {
    keywords: ['referral', 'invite', 'bonus', 'friend'],
    response: "Referral Program:\n\n🎁 Earn 5% of your friend's first deposit!\n\n1. Go to Dashboard → Referrals\n2. Copy your unique referral link\n3. Share with friends\n4. Earn bonus when they deposit\n\nNo limit on referrals!",
    responseKey: 'referral'
  }
];

// Default response when no keywords match
export const DEFAULT_RESPONSE = {
  response: "Thank you for your message! Our support team will review it and get back to you within 24 hours.\n\nFor urgent matters, email us at:\n📧 support@win-tradex.com\n📧 live@win-tradex.com",
  responseKey: 'default'
};
