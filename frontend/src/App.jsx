
import {
  
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import ShopPage from "./features/products/pages/ShopPage";
import ProductDetailsPage from "./features/products/pages/ProductDetailsPage";
import CartPage from "./features/cart/pages/CartPage";
import WishlistPage from "./features/wishlist/pages/WishlistPage";
import CheckoutPage from "./features/checkout/pages/CheckoutPage";
import OrderConfirmationPage from "./features/checkout/pages/OrderConfirmationPage";

import LoginPage from "./features/account/pages/LoginPage";
import RegisterPage from "./features/account/pages/RegisterPage";
import ForgotPasswordPage from "./features/account/pages/ForgotPasswordPage";
import AccountDashboard from "./features/account/pages/AccountDashboard";
import ProfilePage from "./features/account/pages/ProfilePage";
import MyOrdersPage from "./features/account/pages/MyOrdersPage";
import ProtectedAccountRoute from "./features/account/components/ProtectedAccountRoute";

import OrderDetailsPage from "./features/orders/pages/OrderDetailsPage";

import ProtectedAdminRoute from "./features/admin/components/ProtectedAdminRoute";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import AdminProducts from "./features/admin/pages/AdminProducts";
import AdminProductForm from "./features/admin/pages/AdminProductForm";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/shop" element={<ShopPage />} />
      <Route path="/categories" element={<ShopPage />} />

      <Route
        path="/new-arrivals"
        element={<ShopPage collection="new-arrivals" />}
      />

      <Route
        path="/best-sellers"
        element={<ShopPage collection="best-sellers" />}
      />

      <Route
        path="/product/:slug"
        element={<ProductDetailsPage />}
      />

      <Route path="/cart" element={<CartPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />

      <Route
        path="/order-confirmation/:orderId"
        element={<OrderConfirmationPage />}
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<ProtectedAccountRoute />}>
        <Route path="/account" element={<AccountDashboard />} />
        <Route path="/account/profile" element={<ProfilePage />} />
        <Route path="/account/orders" element={<MyOrdersPage />} />

        <Route
          path="/account/orders/:orderId"
          element={<OrderDetailsPage />}
        />
      </Route>

      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/admin/products" element={<AdminProducts />} />

        <Route
          path="/admin/products/new"
          element={<AdminProductForm />}
        />

        <Route
          path="/admin/products/:id/edit"
          element={<AdminProductForm />}
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;
