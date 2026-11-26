
import { lazy, Suspense } from "react";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedAccountRoute from "./features/account/components/ProtectedAccountRoute";
import ProtectedAdminRoute from "./features/admin/components/ProtectedAdminRoute";
import AdminLayout from "./features/admin/components/AdminLayout";

// Public pages
const HomePage = lazy(() => import("./pages/HomePage"));
const ContactPage = lazy(() => import("./features/contact/pages/ContactPage"));
const FaqPage = lazy(() => import("./features/faq/pages/FaqPage"));

const ShopPage = lazy(() => import("./features/products/pages/ShopPage"));
const ProductDetailsPage = lazy(() => import("./features/products/pages/ProductDetailsPage"));

const CartPage = lazy(() => import("./features/cart/pages/CartPage"));
const WishlistPage = lazy(() => import("./features/wishlist/pages/WishlistPage"));
const CheckoutPage = lazy(() => import("./features/checkout/pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("./features/checkout/pages/OrderConfirmationPage"));

// Authentication and account pages
const LoginPage = lazy(() => import("./features/account/pages/LoginPage"));
const RegisterPage = lazy(() => import("./features/account/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./features/account/pages/ForgotPasswordPage"));
const AccountDashboard = lazy(() => import("./features/account/pages/AccountDashboard"));
const ProfilePage = lazy(() => import("./features/account/pages/ProfilePage"));
const MyOrdersPage = lazy(() => import("./features/account/pages/MyOrdersPage"));
const OrderDetailsPage = lazy(() => import("./features/orders/pages/OrderDetailsPage"));

// Admin pages
const AdminDashboard = lazy(() => import("./features/admin/pages/AdminDashboard"));
const AdminProducts = lazy(() => import("./features/admin/pages/AdminProducts"));
const AdminProductForm = lazy(() => import("./features/admin/pages/AdminProductForm"));
const AdminCategories = lazy(() => import("./features/admin/pages/AdminCategories"));
const AdminCategoryForm = lazy(() => import("./features/admin/pages/AdminCategoryForm"));
const AdminOrders = lazy(() => import("./features/admin/pages/AdminOrders"));
const AdminOrderDetails = lazy(() => import("./features/admin/pages/AdminOrderDetails"));
const AdminCustomers = lazy(() => import("./features/admin/pages/AdminCustomers"));
const AdminCustomerDetails = lazy(() => import("./features/admin/pages/AdminCustomerDetails"));

function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        padding: "32px 20px",
        color: "var(--color-text, #333)",
        fontSize: "14px",
        fontWeight: 500,
      }}
    >
      <span>Loading NexaMart...</span>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/faqs" element={<FaqPage />} />

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
          <Route element={<AdminLayout />}>
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

            <Route path="/admin/categories" element={<AdminCategories />} />

            <Route
              path="/admin/categories/new"
              element={<AdminCategoryForm />}
            />

            <Route
              path="/admin/categories/:id/edit"
              element={<AdminCategoryForm />}
            />

            <Route path="/admin/orders" element={<AdminOrders />} />

            <Route
              path="/admin/orders/:orderId"
              element={<AdminOrderDetails />}
            />

            <Route path="/admin/customers" element={<AdminCustomers />} />

            <Route
              path="/admin/customers/:customerId"
              element={<AdminCustomerDetails />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </Suspense>
  );
}

export default App;
