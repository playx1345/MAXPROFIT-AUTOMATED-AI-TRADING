import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./PageTransition";
import { PageLoader } from "./PageLoader";
import ProtectedRoute from "./ProtectedRoute";
import AdminProtectedRoute from "./AdminProtectedRoute";
import DashboardLayout from "./DashboardLayout";
import AdminLayout from "./AdminLayout";

// Lazy-loaded pages
const Landing = lazy(() => import("@/pages/Landing"));
const Auth = lazy(() => import("@/pages/Auth"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Investments = lazy(() => import("@/pages/Investments"));
const Transactions = lazy(() => import("@/pages/Transactions"));
const Deposit = lazy(() => import("@/pages/Deposit"));
const Withdraw = lazy(() => import("@/pages/Withdraw"));
const Referrals = lazy(() => import("@/pages/Referrals"));
const Profile = lazy(() => import("@/pages/Profile"));
const AdminLogin = lazy(() => import("@/pages/admin/Login"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminDeposits = lazy(() => import("@/pages/admin/Deposits"));
const AdminWithdrawals = lazy(() => import("@/pages/admin/Withdrawals"));
const AdminInvestments = lazy(() => import("@/pages/admin/Investments"));
const AdminTradingBot = lazy(() => import("@/pages/admin/TradingBot"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const AdminActivityLog = lazy(() => import("@/pages/admin/ActivityLog"));
const AdminTransactions = lazy(() => import("@/pages/admin/Transactions"));
const AdminAnalytics = lazy(() => import("@/pages/admin/Analytics"));
const AdminReversals = lazy(() => import("@/pages/admin/Reversals"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const TermsAndConditions = lazy(() => import("@/pages/legal/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("@/pages/legal/PrivacyPolicy"));
const RiskDisclosure = lazy(() => import("@/pages/legal/RiskDisclosure"));
const AMLKYCPolicy = lazy(() => import("@/pages/legal/AMLKYCPolicy"));
const CookiePolicy = lazy(() => import("@/pages/legal/CookiePolicy"));

const DashboardRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <DashboardLayout>
      <PageTransition>{children}</PageTransition>
    </DashboardLayout>
  </ProtectedRoute>
);

const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <AdminProtectedRoute>
    <AdminLayout>
      <PageTransition>{children}</PageTransition>
    </AdminLayout>
  </AdminProtectedRoute>
);

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardRoute><Dashboard /></DashboardRoute>} />
          <Route path="/dashboard/investments" element={<DashboardRoute><Investments /></DashboardRoute>} />
          <Route path="/dashboard/transactions" element={<DashboardRoute><Transactions /></DashboardRoute>} />
          <Route path="/dashboard/deposit" element={<DashboardRoute><Deposit /></DashboardRoute>} />
          <Route path="/dashboard/withdraw" element={<DashboardRoute><Withdraw /></DashboardRoute>} />
          <Route path="/dashboard/referrals" element={<DashboardRoute><Referrals /></DashboardRoute>} />
          <Route path="/dashboard/profile" element={<DashboardRoute><Profile /></DashboardRoute>} />

          {/* Admin */}
          <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/transactions" element={<AdminRoute><AdminTransactions /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
          <Route path="/admin/deposits" element={<AdminRoute><AdminDeposits /></AdminRoute>} />
          <Route path="/admin/withdrawals" element={<AdminRoute><AdminWithdrawals /></AdminRoute>} />
          <Route path="/admin/investments" element={<AdminRoute><AdminInvestments /></AdminRoute>} />
          <Route path="/admin/trading-bot" element={<AdminRoute><AdminTradingBot /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="/admin/reversals" element={<AdminRoute><AdminReversals /></AdminRoute>} />
          <Route path="/admin/activity-log" element={<AdminRoute><AdminActivityLog /></AdminRoute>} />

          {/* Legal */}
          <Route path="/legal/terms" element={<PageTransition><TermsAndConditions /></PageTransition>} />
          <Route path="/legal/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/legal/risk" element={<PageTransition><RiskDisclosure /></PageTransition>} />
          <Route path="/legal/aml-kyc" element={<PageTransition><AMLKYCPolicy /></PageTransition>} />
          <Route path="/legal/cookies" element={<PageTransition><CookiePolicy /></PageTransition>} />

          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};
