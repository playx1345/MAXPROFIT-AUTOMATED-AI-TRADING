# Max Forex & Automated Trading Robot Platform

A secure, compliant cryptocurrency investment platform powered by advanced AI trading technology, designed specifically for the Nigerian market and global crypto investors.

## 🎯 Project Overview

Max Forex & Automated Trading Robot Org is a cutting-edge digital investment platform that enables clients to invest in cryptocurrency portfolios managed by AI-driven trading algorithms. The platform prioritizes security, regulatory compliance, transparency, and user experience while providing seamless crypto-based investing with automated profit generation.

## ✨ Key Features

### Client Features
- **Secure Registration & KYC**: Comprehensive onboarding with government ID verification, proof of address, and biometric validation
- **User Dashboard**: Real-time portfolio tracking, investment management, and transaction history
- **Multi-Tier Investment Plans**: Three investment tiers ($250, $500, $1000 USDT) with transparent profit-sharing
- **Crypto Deposits**: Support for USDT (TRC20) and Bitcoin (BTC) with QR code integration
- **Fast Withdrawals**: 24-hour processing time with transparent fee structure
- **Live Chat Support**: Real-time communication with platform administrators
- **Multi-Factor Authentication**: Enhanced security with 2FA support
- **Referral System**: Earn bonuses when referred users make their first deposit

### Admin Features
- **Centralized Dashboard**: Complete oversight of user accounts, transactions, and KYC verification
- **Deposit/Withdrawal Management**: Real-time approval workflow for all financial transactions
- **User Management**: Create, edit, and manage client accounts with full audit trails
- **Notification Center**: Instant alerts for registrations, deposits, and withdrawal requests
- **Live Chat Management**: Respond to client inquiries with full conversation history
- **Investment Plan Control**: Configure and manage investment tiers and profit structures
- **Security Logs**: Comprehensive audit trails for all administrative actions

## 💼 Investment Plans

| Plan Tier | Minimum Deposit | Platform Share | Client Earnings | Withdrawal Time |
|-----------|----------------|----------------|-----------------|-----------------|
| **Silver** | $250 USDT | 20% | 100% principal + AI profits (minus 20% share) | ≤ 24 hours |
| **Gold** | $500 USDT | 20% | 100% principal + AI profits (minus 20% share) | ≤ 24 hours |
| **Platinum** | $1000 USDT | 20% | 100% principal + AI profits (minus 20% share) | ≤ 24 hours |

### Profit Distribution Model
- Clients retain 100% of their invested principal
- AI trading robot generates market-based profits
- Platform retains 20% of trading profits
- Net profits credited to client accounts
- Transparent fee disclosure (blockchain charges + VAT)

## 🏗️ Technical Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL with Row-Level Security (RLS)
- **Authentication**: Supabase Auth with MFA support
- **Real-time**: Supabase Realtime for live updates
- **Routing**: React Router v6

### Database Schema
- **profiles**: User information, KYC status, wallet addresses, balances
- **user_roles**: Role-based access control (admin/user)
- **investment_plans**: Configurable investment tiers
- **investments**: Active and historical user investments
- **transactions**: Deposit, withdrawal, and profit records
- **trading_bot_performance**: AI trading activity logs
- **referrals**: Referral tracking and bonus management

### Storage Buckets
- **kyc-documents**: KYC verification documents (private, 5MB limit)
- **profile-pictures**: User avatars (public, 2MB limit)
- **transaction-receipts**: Deposit/withdrawal receipts (private, 10MB limit)
- **platform-documents**: Terms, policies, guides (public, 50MB limit)

For detailed information about storage buckets, see [Storage Buckets Documentation](./docs/STORAGE_BUCKETS.md)

### Security Features
- Row-Level Security (RLS) policies on all tables
- Security definer functions for privilege checking
- Encrypted password storage with bcrypt
- JWT-based session management
- IP logging and rate limiting
- Automated security alerts
- Cold storage for excess reserves
- HD wallet systems for address generation

## 🔐 Security & Compliance

### Regulatory Compliance (Nigeria)
- **KYC/AML**: Robust identity verification compliant with SEC and CBN guidelines
- **Data Protection**: NDPR-compliant data handling and storage
- **Tax Compliance**: Automatic VAT calculation and transparent fee disclosure
- **Consumer Protection**: Clear risk disclosures and investment terms
- **Platform Registration**: Legal entity establishment per Nigerian regulations

### Security Protocols
- Multi-factor authentication (MFA) for all users
- End-to-end encryption for sensitive data
- Blockchain transaction monitoring
- Funds segregation (operational vs. client funds)
- Cold storage for majority of reserves
- Regular security audits and penetration testing
- Anti-phishing user education

### AML Monitoring
- Real-time transaction screening
- Sanctions list checking (OFAC, UN, EU)
- PEP (Politically Exposed Person) database screening
- Suspicious activity pattern detection
- Automated flagging and reporting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
The following environment variables are automatically configured via Lovable Cloud:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

### Admin Access

#### Primary Admin
**Email**: maxforexautomatedforexroboti@gmail.com  
**Password**: 338822  
⚠️ **Important**: Enable 2FA immediately after first login

#### Secondary Admin Setup
**Email**: djplayxsilas134@gmail.com  

To set up the secondary admin account:

1. Get your Supabase service role key from:
   - Supabase Dashboard → Project Settings → API → `service_role` key (secret)

2. Run the setup script:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key ADMIN_PASSWORD=your_secure_password npm run setup:admin
   ```

3. The script will:
   - Create the admin user account (if it doesn't exist)
   - Set the password from `ADMIN_PASSWORD` env var, or generate a secure random one
   - Display the password if it was generated (save it immediately!)
   - Assign admin role in the database

4. **⚠️ IMPORTANT**: Change the password immediately after first login!

For more details, see `scripts/README.md`.

**Alternative method**: You can also create the admin user manually via:
- Supabase Dashboard → Authentication → Users → Add User
- Then assign admin role by inserting into `user_roles` table

## 📱 User Journey

### For Clients
1. **Register**: Create account with email and password
2. **Complete KYC**: Upload ID documents and verification selfie
3. **Choose Investment Plan**: Select Silver, Gold, or Platinum tier
4. **Deposit Funds**: Transfer USDT or BTC to provided wallet address
5. **Track Performance**: Monitor investments and profits in real-time
6. **Request Withdrawal**: Submit withdrawal request (processed within 24 hours)
7. **Refer Friends**: Share referral link and earn bonuses

### For Administrators
1. **Login**: Access admin dashboard with secure credentials
2. **Review KYC**: Approve or reject identity verification submissions
3. **Process Deposits**: Verify and approve incoming crypto deposits
4. **Manage Withdrawals**: Review and process withdrawal requests
5. **Monitor Platform**: Track user activity, investments, and system health
6. **Respond to Support**: Handle client inquiries via live chat

## 💬 Customer Support

### Live Chat
- Integrated real-time messaging in client dashboard
- Encrypted communication
- Full conversation history
- Auto-responders for common queries

### FAQ Coverage
- Investment minimums and plans
- Deposit/withdrawal procedures
- KYC requirements
- Profit calculation methodology
- Fee structure
- Security best practices
- Regulatory compliance
- Account troubleshooting

## 🤖 AI Trading Robot

### Features
- Advanced machine learning algorithms
- Real-time market analysis
- Statistical arbitrage strategies
- High-frequency trading capabilities
- Automated risk management
- Performance monitoring and alerts

### Security
- Sandboxed execution environment
- Encrypted API key storage
- Real-time anomaly detection
- Automated fail-safe mechanisms
- Transparent performance reporting

## 📊 Notifications System

### Client Notifications
- Login alerts (especially from new locations)
- Deposit confirmations with blockchain details
- Withdrawal status updates
- KYC verification results
- Profit distribution alerts
- Promotional announcements

### Admin Notifications
- New user registrations
- Pending deposit approvals
- Withdrawal requests
- Failed login attempts
- System health alerts
- Suspicious activity flags

## 🛠️ Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── DashboardLayout.tsx
│   └── ProtectedRoute.tsx
├── pages/              # Route pages
│   ├── Landing.tsx     # Public landing page
│   ├── Auth.tsx        # Login/signup
│   ├── Dashboard.tsx   # Client dashboard
│   ├── Investments.tsx # Investment management
│   ├── Profile.tsx     # User profile & KYC
│   └── NotFound.tsx    # 404 page
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client & types
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── main.tsx            # Application entry point
```

### Key Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📈 Deployment

### Via Lovable
1. Click "Publish" in the Lovable editor
2. Your app will be deployed to `<project-name>.lovable.app`
3. Configure custom domain in Project > Settings > Domains

### Manual Deployment
```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

## 🔗 Useful Resources

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)

## ⚖️ Legal & Compliance

### Risk Disclosures
- Cryptocurrency investments carry significant risk
- Past performance does not guarantee future results
- Clients may lose some or all of their investment
- Only invest what you can afford to lose

### Terms & Conditions
- Comprehensive Terms of Service
- Privacy Policy (GDPR/NDPR compliant)
- Risk Disclosure Document
- Cookie Consent Policy

## 📞 Contact

**Platform**: Max Forex & Automated Trading Robot Org  
**Admin Email**: maxforexautomatedforexroboti@gmail.com  
**Support**: Available via live chat in client dashboard

---

**⚠️ Disclaimer**: This platform facilitates cryptocurrency investments which are subject to market risk. All users must complete KYC verification and acknowledge investment risks before participating. The platform operates in compliance with Nigerian regulatory requirements as of 2025.
