import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { CustomerRoute } from "@/components/auth/CustomerRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Supplier from "./pages/Supplier";
import SupplierRegister from "./pages/SupplierRegister";
import Admin from "./pages/Admin";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Products from "./pages/Products";
import Notifications from "./pages/Notifications";
import Cart from "./pages/Cart";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import LegalNotice from "./pages/LegalNotice";
import StudentExchangePage from "./pages/StudentExchangePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Index />} />
          {/* Route Produits - masquée pour les fournisseurs */}
          <Route path="/products" element={
            <CustomerRoute>
              <Products />
            </CustomerRoute>
          } />
          <Route path="/register" element={<Register />} />
          <Route path="/supplier-register" element={<SupplierRegister />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/legal-notice" element={<LegalNotice />} />

          {/* Routes protégées - nécessitent authentification */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute>
              <CustomerRoute>
                <Cart />
              </CustomerRoute>
            </ProtectedRoute>
          } />
          <Route path="/supplier" element={
            <ProtectedRoute>
              <Supplier />
            </ProtectedRoute>
          } />
          <Route path="/student-exchange" element={
            <ProtectedRoute>
              <StudentExchangePage />
            </ProtectedRoute>
          } />

          {/* Route Admin - nécessite admin_role */}
          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
