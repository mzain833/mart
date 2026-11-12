
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import ShopPage from "./features/products/pages/ShopPage";
import ProductDetailsPage from "./features/products/pages/ProductDetailsPage";

function App() {
  return (
    
      <Routes>

        <Route path="/" element={<HomePage />} />

        <Route path="/shop" element={<ShopPage />} />

        <Route
          path="/categories"
          element={<ShopPage />}
        />

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

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    
  );
}

export default App;
