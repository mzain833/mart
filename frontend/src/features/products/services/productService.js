
import apiClient from "../../../lib/apiClient.js";

const normalizeProduct = (product) => ({
  ...product,
  id: product.sku,
  rating: Number(product.rating ?? 0),
  reviewCount: Number(product.reviewCount ?? 0),
  stock: Number(product.stock ?? 0),
  isNew: product.isNewArrival ?? false,
});;

const getProductsPage = async (params = {}) => {
  const response = await apiClient.get("/products", {
    params,
  });

  const result = response.data.data;

  return {
    ...result,
    products: result.products.map(normalizeProduct),
  };
};

const getProducts = async (params = {}) => {
  const result = await getProductsPage(params);

  return result.products;
};


const getProductBySlug = async (slug) => {
  try {
    const response = await apiClient.get(
      `/products/${encodeURIComponent(slug)}`
    );

    return normalizeProduct(response.data.data.product);
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }

    throw error;
  }
};



const getProductById = async (id) => {
  const products = await getProducts({ limit: 100 });

  return products.find((product) => product.id === id) ?? null;
};

const getCategories = async () => {
  const response = await apiClient.get("/products/categories");

  return response.data.data;
};

export const productService = {
  getProducts,
  getProductsPage,
  getProductBySlug,
  getProductById,
  getCategories,
};
