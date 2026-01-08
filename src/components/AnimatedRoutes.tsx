import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./PageTransition";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Investments from "@/pages/Investments";
import Transactions from "@/pages/Transactions";
import Deposit from "@/pages/Deposit";
import Withdraw from "@/pages/Withdraw";
import Referrals from "@/pages/Referrals";
import Profile from "@/pages/Profile";
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminDeposits from "@/pages/admin/Deposits";
import AdminWithdrawals from "@/pages/admin/Withdrawals";
import AdminInvestments from "@/pages/admin/Investments";
import AdminTradingBot from "@/pages/admin/TradingBot";
import AdminSettings from "@/pages/admin/Settings";
import AdminActivityLog from "@/pages/admin/ActivityLog";
import AdminTransactions from "@/pages/admin/Transactions";
import AdminAnalytics from "@/pages/admin/Analytics";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import AdminProtectedRoute from "./AdminProtectedRoute";
import DashboardLayout from "./DashboardLayout";
import AdminLayout from "./AdminLayout";

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <Landing />
          </PageTransition>
        } />
        <Route path="/auth" element={
          <PageTransition>
            <Auth />
          </PageTransition>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/investments" element={
          <ProtectedRoute>
            <DashboardLayout>
              <PageTransition>
                <Investments />
              </PageTransition>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/transactions" element={
          <ProtectedRoute>
            <DashboardLayout>
              <PageTransition>
                <Transactions />
              </PageTransition>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/deposit" element={
          <ProtectedRoute>
            <DashboardLayout>
              <PageTransition>
                <Deposit />
              </PageTransition>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/withdraw" element={
          <ProtectedRoute>
            <DashboardLayout>
              <PageTransition>
                <Withdraw />
              </PageTransition>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/referrals" element={
          <ProtectedRoute>
            <DashboardLayout>
              <PageTransition>
                <Referrals />
              </PageTransition>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/profile" element={
          <ProtectedRoute>
            <DashboardLayout>
              <PageTransition>
                <Profile />
              </PageTransition>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={
          <PageTransition>
            <AdminLogin />
          </PageTransition>
        } />
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <PageTransition>
                <AdminDashboard />
              </PageTransition>
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <PageTransition>
                <AdminUsers />
              </PageTransition>
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/transactions" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <PageTransition>
                <AdminTransactions />
              </PageTransition>
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <PageTransition>
                <AdminAnalytics />
              </PageTransition>
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/deposits" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <PageTransition>
                <AdminDeposits />
              </PageTransition>
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/withdrawals" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <PageTransition>
                <AdminWithdrawals />
              </PageTransition>
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/investments" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <PageTransition>
                <AdminInvestments />
              </PageTransition>
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/trading-bot" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <PageTransition>
                <AdminTradingBot />
              </PageTransition>
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <PageTransition>
                <AdminSettings />
              </PageTransition>
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/activity-log" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <PageTransition>
                <AdminActivityLog />
              </PageTransition>
            </AdminLayout>
          </AdminProtectedRoute>
        } />
        
        <Route path="*" element={
          <PageTransition>
            <NotFound />
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
};
