
import { useEffect, useMemo, useState } from "react";
import { productService } from "../services/productService";
import {
  filterProducts,
  sortProducts,
} from "../utils/productUtils";

export default function useProducts({
  search = "",
  category = "all",
  maxPrice = 100000,
  minRating = 0,
  inStockOnly = false,
  sortBy = "featured",
  collection = "all",
} = {}) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await productService.getProducts();

        if (isMounted) {
          setProducts(data);
        }
      } catch {
        if (isMounted) {
          setError("Products load nahi ho sake. Dobara try karein.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(products, {
      search,
      category,
      maxPrice,
      minRating,
      inStockOnly,
      collection,
    });

    return sortProducts(filtered, sortBy);
  }, [
    products,
    search,
    category,
    maxPrice,
    minRating,
    inStockOnly,
    sortBy,
    collection,
  ]);

  return {
    products: filteredProducts,
    totalProducts: products.length,
    isLoading,
    error,
  };
}
