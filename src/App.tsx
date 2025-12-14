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
import ProductDetails from "./pages/ProductDetails";
import Notifications from "./pages/Notifications";
import Cart from "./pages/Cart";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import LegalNotice from "./pages/LegalNotice";
import StudentExchangePage from "./pages/StudentExchangePage";
import ListingDetails from "./pages/ListingDetails";
import CreateListing from "./pages/CreateListing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Favorites from "./pages/Favorites";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import SupplierOrders from "./pages/SupplierOrders";
import AddProduct from "./pages/AddProduct";

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
          <Route path="/products/:id" element={
            <CustomerRoute>
              <ProductDetails />
            </CustomerRoute>
          } />
          <Route path="/register" element={<Register />} />
          <Route path="/supplier-register" element={<SupplierRegister />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/legal-notice" element={<LegalNotice />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

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
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CustomerRoute>
                <Checkout />
              </CustomerRoute>
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <CustomerRoute>
                <MyOrders />
              </CustomerRoute>
            </ProtectedRoute>
          } />
          <Route path="/orders/:orderId" element={
            <ProtectedRoute>
              <CustomerRoute>
                <OrderDetails />
              </CustomerRoute>
            </ProtectedRoute>
          } />
          <Route path="/supplier" element={
            <ProtectedRoute>
              <Supplier />
            </ProtectedRoute>
          } />
          <Route path="/supplier/orders" element={
            <ProtectedRoute>
              <SupplierOrders />
            </ProtectedRoute>
          } />
          <Route path="/add-product" element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          } />
          <Route path="/student-exchange" element={
            <ProtectedRoute>
              <StudentExchangePage />
            </ProtectedRoute>
          } />
          <Route path="/student-exchange/create" element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          } />
          <Route path="/student-exchange/edit/:id" element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          } />
          <Route path="/student-exchange/:id" element={
            <ProtectedRoute>
              <ListingDetails />
            </ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute>
              <CustomerRoute>
                <Favorites />
              </CustomerRoute>
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
