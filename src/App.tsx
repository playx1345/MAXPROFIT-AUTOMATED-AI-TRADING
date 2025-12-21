import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Investments from "./pages/Investments";
import Transactions from "./pages/Transactions";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Referrals from "./pages/Referrals";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminDeposits from "./pages/admin/Deposits";
import AdminWithdrawals from "./pages/admin/Withdrawals";
import AdminInvestments from "./pages/admin/Investments";
import AdminTradingBot from "./pages/admin/TradingBot";
import AdminSettings from "./pages/admin/Settings";
import AdminActivityLog from "./pages/admin/ActivityLog";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import AdminLayout from "./components/AdminLayout";
import LiveChat from "./components/LiveChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LiveChat />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/investments" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Investments />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/transactions" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Transactions />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/deposit" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Deposit />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/withdraw" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Withdraw />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/referrals" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Referrals />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/profile" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/deposits" element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminDeposits />
              </AdminLayout>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/withdrawals" element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminWithdrawals />
              </AdminLayout>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/investments" element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminInvestments />
              </AdminLayout>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/trading-bot" element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminTradingBot />
              </AdminLayout>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </AdminProtectedRoute>
          } />
          <Route path="/admin/activity-log" element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminActivityLog />
              </AdminLayout>
            </AdminProtectedRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
