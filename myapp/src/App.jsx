import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

//User Imports
import HomePage from "./pages/user pages/HomePage";
import LandingPage from "./pages/user pages/LandingPage"; // Import LandingPage
import Login from "./components/user components/Login";
import Signup from "./components/user components/Signup"; // Import Signup
import ForgotPassword from "./components/user components/ForgotPassword"; // Import Forgot Password
import Logout from "./components/user components/Logout";
import ProductsPage from "./pages/user pages/ProductsPage";
import SellPage from "./pages/user pages/SellPage";
import AuctionBuyPage from "./pages/user pages/AuctionBuyPage";
import ProfilePage from "./pages/user pages/ProfilePage"; // Import User Profile
import OrderPage from "./pages/user pages/OrderPage";
import ResetPassword from "./components/user components/ResetPassword";
import ProtectedRoute from "./components/guards/ProtectedRoute";

//Admin Imports
import AdminHomePage from "./pages/admin pages/AdminHomePage";
import BidManagementPage from "./pages/admin pages/ManageBidsPage";
import ManageUsersPage from "./pages/admin pages/ManageUsersPage";
import ManageProductsPage from "./pages/admin pages/ManageProductsPage";
import AdminProfilePage from "./pages/admin pages/AdminProfilePage"; // Import Admin Profile
import ManageOrdersPage from "./pages/admin pages/ManageOrdersPage";
import AdminRoute from "./components/guards/AdminRoute";
import AdminLogin from "./components/admin components/AdminLogin";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected User Routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <SellPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/auction-buy"
          element={
            <ProtectedRoute>
              <AuctionBuyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/logout"
          element={
            <ProtectedRoute>
              <Logout />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminHomePage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/bids"
          element={
            <AdminRoute>
              <BidManagementPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <ManageUsersPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <ManageProductsPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <ManageOrdersPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/profile"
          element={
            <AdminRoute>
              <AdminProfilePage />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
