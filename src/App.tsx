import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Investments from "./pages/Investments";
import Transactions from "./pages/Transactions";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Referrals from "./pages/Referrals";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
