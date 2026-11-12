
export function formatPrice(price) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function getDiscountPercentage(price, compareAtPrice) {
  if (!compareAtPrice || compareAtPrice <= price) {
    return 0;
  }

  return Math.round(
    ((compareAtPrice - price) / compareAtPrice) * 100
  );
}

export function getProductCategories(products) {
  return [...new Set(products.map((product) => product.category))];
}

export function filterProducts(products, filters = {}) {
  const {
    search = "",
    category = "all",
    maxPrice = Infinity,
    minRating = 0,
    inStockOnly = false,
    collection = "all",
  } = filters;

  const normalizedSearch = search.trim().toLowerCase();

  return products.filter((product) => {
    const matchesSearch =
      !normalizedSearch ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.category.toLowerCase().includes(normalizedSearch);

    const matchesCategory =
      category === "all" || product.category === category;

    const matchesPrice = product.price <= maxPrice;

    const matchesRating = product.rating >= minRating;

    const matchesStock =
      !inStockOnly || product.stock > 0;

    const matchesCollection =
      collection === "all" ||
      (collection === "new-arrivals" && product.isNew) ||
      (collection === "best-sellers" && product.bestSeller);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPrice &&
      matchesRating &&
      matchesStock &&
      matchesCollection
    );
  });
}

export function sortProducts(products, sortBy = "featured") {
  const sorted = [...products];

  switch (sortBy) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);

    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);

    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);

    case "newest":
      return sorted.sort(
        (a, b) => Number(b.isNew) - Number(a.isNew)
      );

    default:
      return sorted.sort(
        (a, b) => Number(b.bestSeller) - Number(a.bestSeller)
      );
  }
}
