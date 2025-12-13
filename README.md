# Win Trade Invest

A secure, compliant cryptocurrency investment platform powered by advanced AI trading technology, designed specifically for the Nigerian market and global crypto investors.

## 🎯 Project Overview

Win Trade Invest is a cutting-edge digital investment platform that enables clients to invest in cryptocurrency portfolios managed by AI-driven trading algorithms. The platform prioritizes security, regulatory compliance, transparency, and user experience while providing seamless crypto-based investing with automated profit generation.

## ✨ Key Features

### Client Features
- **Secure Registration & KYC**: Comprehensive onboarding with government ID verification, proof of address, and biometric validation
- **User Dashboard**: Real-time portfolio tracking, investment management, and transaction history
- **Multi-Tier Investment Plans**: Three investment tiers ($250, $500, $1000 USDT) with transparent profit-sharing
- **Crypto Deposits**: Support for USDT (TRC20) and Bitcoin (BTC) with QR code integration
- **Fast Withdrawals**: 24-hour processing time with transparent fee structure (10% BTC confirmation fee required)
- **Live Chat Support**: Real-time communication with platform administrators
- **Multi-Factor Authentication**: Enhanced security with 2FA support
- **Referral System**: Earn bonuses when referred users make their first deposit
- **High-Volume Account Fees**: Automated fee notifications for accounts exceeding $50,000 in total investments

### Admin Features
- **Centralized Dashboard**: Complete oversight of user accounts, transactions, and KYC verification
- **Deposit/Withdrawal Management**: Real-time approval workflow for all financial transactions with blockchain-verified BTC confirmation fees
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

## 💸 Withdrawal Confirmation Fee

To ensure security and prevent fraudulent withdrawals, the platform requires a 10% confirmation fee paid in Bitcoin (BTC) before any withdrawal can be approved.

### How It Works
- **Fee Amount**: 10% of the withdrawal amount
- **Payment Method**: Must be paid in BTC to the platform's confirmation wallet
- **Wallet Address**: `bc1q3jjvkvy9wt54tn05qzk7spryramhkz7qltn2ny`
- **Verification**: Blockchain verification ensures payment is received before approval
- **Processing**: Once verified, withdrawal is processed within 24 hours

### Withdrawal Process
1. **Request Withdrawal**: Submit withdrawal request through your dashboard
2. **Calculate Fee**: System calculates 10% fee in USD, convert to BTC at current rate
3. **Pay Fee**: Send exact BTC amount to confirmation wallet address
4. **Submit Transaction Hash**: Provide Bitcoin transaction hash to admin
5. **Verification**: Admin verifies payment on Bitcoin blockchain using edge function
6. **Approval**: Once verified, withdrawal is approved and processed

### Security Features
- **Blockchain Verification**: All payments verified on Bitcoin blockchain
- **Correct Address Check**: System ensures payment went to correct BTC address
- **Amount Verification**: Validates correct fee amount was paid (±1% tolerance)
- **Confirmation Requirement**: Requires at least 1 blockchain confirmation
- **Audit Trail**: All verifications logged for transparency and security

### Important Notes
⚠️ **This fee is mandatory** - Withdrawals cannot be approved without verified BTC confirmation fee  
⚠️ **Non-refundable** - Confirmation fees are non-refundable once paid  
⚠️ **Price Fluctuation** - BTC price may change between calculation and payment; ±1% tolerance allowed  
⚠️ **Correct Address** - Always send to: `bc1q3jjvkvy9wt54tn05qzk7spryramhkz7qltn2ny`

For detailed technical documentation, see [Confirmation Fee Verification Guide](./docs/CONFIRMATION_FEE_VERIFICATION.md).


## 🚀 High-Volume Account Fee System

⚠️ **Important**: A mandatory $1,000 platform access fee is required when total investments exceed $50,000. Please review this policy carefully before reaching this threshold.

For accounts that reach high investment volumes, the platform implements an automated fee notification system:

### How It Works
- **Trigger Threshold**: Automatically activated when total investments exceed $50,000
- **Platform Access Fee**: One-time payment of $1,000 required for continued platform access
- **Notification Window**: 3-hour countdown timer displayed on login after threshold is reached
- **Notification Method**: Real-time popup alert with live countdown
- **Enforcement**: Account access is restricted if fee is not paid within the time limit

### What Happens During Restriction
- Users cannot make new investments or withdrawals during restriction period
- Existing investments remain in the account
- Account can be reactivated by completing the $1,000 fee payment
- Access to view account information remains available

### Features
- **Live Countdown Timer**: Shows hours, minutes, and seconds remaining
- **Investment Summary**: Displays current total investment amount
- **Direct Payment Link**: One-click navigation to deposit page for fee payment
- **Clear Notification**: High-visibility alert ensures user awareness of requirement

### Technical Requirements
- User must have verified KYC status
- Total investment balance must exceed $50,000
- Fee is required once when crossing the high-volume threshold
- Payment processes through standard platform deposit methods

### Important Information
- **Fee Structure**: This is a mandatory platform access fee, not an optional upgrade
- **Timing**: Users are notified immediately upon crossing the $50,000 threshold
- **Transparency**: The notification includes clear information about the fee requirement and timeline
- **Terms**: All platform fees and policies are detailed in the Terms of Service

**⚠️ Investment Advisory**: Users should carefully review all fee structures and account policies before investing, especially if planning to invest amounts approaching or exceeding the $50,000 threshold. The $1,000 fee represents 2% of the threshold amount and is a significant consideration for investment planning.

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
- **profiles**: User information, KYC status, wallet addresses, balances, upgrade_fee_paid (boolean) for high-volume account fee tracking
- **user_roles**: Role-based access control (admin/user)
- **investment_plans**: Configurable investment tiers
- **investments**: Active and historical user investments
- **transactions**: Deposit, withdrawal, and profit records
- **trading_bot_performance**: AI trading activity logs
- **referrals**: Referral tracking and bonus management
- **admin_activity_logs**: Comprehensive audit trails for administrative actions
- **contact_messages**: User support messages and inquiries

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
7. **Pay Confirmation Fee**: Send 10% BTC confirmation fee to platform wallet for withdrawal verification
8. **Refer Friends**: Share referral link and earn bonuses
9. **High-Volume Fee** (if applicable): Pay mandatory $1,000 fee if investments exceed $50,000 threshold

### For Administrators
1. **Login**: Access admin dashboard with secure credentials
2. **Review KYC**: Approve or reject identity verification submissions
3. **Process Deposits**: Verify and approve incoming crypto deposits
4. **Verify Confirmation Fees**: Verify users have paid 10% BTC confirmation fee for withdrawals
5. **Manage Withdrawals**: Review and process withdrawal requests (after fee verification)
6. **Monitor Platform**: Track user activity, investments, and system health
7. **Respond to Support**: Handle client inquiries via live chat

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
- **High-volume account fee requirements** with countdown timer
- Promotional announcements

### Admin Notifications
- New user registrations
- Pending deposit approvals
- Withdrawal requests
- Failed login attempts
- System health alerts
- Suspicious activity flags
- High-volume account fee payment confirmations

## 🛠️ Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── DashboardLayout.tsx
│   ├── ProtectedRoute.tsx
│   ├── UpgradeFeeNotification.tsx  # Automated upgrade fee alert system
│   └── landing/        # Landing page components
├── pages/              # Route pages
│   ├── Landing.tsx     # Public landing page
│   ├── Auth.tsx        # Login/signup
│   ├── Dashboard.tsx   # Client dashboard
│   ├── Investments.tsx # Investment management
│   ├── Profile.tsx     # User profile & KYC
│   ├── admin/          # Admin panel pages
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

For complete deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

### Quick Start with Deployment Helper

```bash
# Make the script executable (first time only)
chmod +x deploy.sh

# Run the deployment helper
./deploy.sh
```

The deployment helper provides options for:
- Installing dependencies
- Building the application
- Deploying Edge Functions
- Applying database migrations
- Setting up admin users
- Running dev/production builds

### Manual Deployment
```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

### Deployment Platforms Supported
- **Vercel** (Recommended)
- **Netlify**
- **Custom VPS/Cloud Server**
- **Lovable Platform**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions for each platform.

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

**Platform**: Win Trade Invest  
**Admin Email**: maxforexautomatedforexroboti@gmail.com  
**Support**: Available via live chat in client dashboard

---

**⚠️ Disclaimer**: This platform facilitates cryptocurrency investments which are subject to market risk. All users must complete KYC verification and acknowledge investment risks before participating. The platform operates in compliance with Nigerian regulatory requirements as of 2025.
