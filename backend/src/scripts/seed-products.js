
import "dotenv/config";
import mongoose from "mongoose";

import Product from "../models/product/Product.model.js";

const products = [
  {
    sku: "NM-001",
    slug: "premium-wireless-headphones",
    name: "Premium Wireless Headphones",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85",
    price: 18500,
    compareAtPrice: 22000,
    rating: 4.8,
    reviewCount: 124,
    badge: "BEST SELLER",
    description: "Experience exceptional audio clarity with premium wireless headphones designed for everyday comfort and immersive listening.",
    stock: 18,
    isNewArrival: false,
    bestSeller: true,
  },
  {
    sku: "NM-002",
    slug: "urban-classic-sneakers",
    name: "Urban Classic Sneakers",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=85",
    price: 12500,
    compareAtPrice: 15000,
    rating: 4.6,
    reviewCount: 86,
    badge: "POPULAR",
    description: "Modern everyday sneakers combining timeless styling, comfort and versatile everyday performance.",
    stock: 24,
    isNewArrival: true,
    bestSeller: false,
  },
  {
    sku: "NM-003",
    slug: "minimalist-classic-watch",
    name: "Minimalist Classic Watch",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=85",
    price: 24500,
    compareAtPrice: 29000,
    rating: 4.9,
    reviewCount: 153,
    badge: "PREMIUM",
    description: "A refined minimalist timepiece designed to complement both casual and formal wardrobes.",
    stock: 12,
    isNewArrival: false,
    bestSeller: true,
  },
  {
    sku: "NM-004",
    slug: "modern-designer-chair",
    name: "Modern Designer Chair",
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=85",
    price: 32000,
    compareAtPrice: null,
    rating: 4.7,
    reviewCount: 42,
    badge: "NEW",
    description: "A contemporary furniture piece combining elegant design with functional comfort.",
    stock: 7,
    isNewArrival: true,
    bestSeller: false,
  },
  {
    sku: "NM-005",
    slug: "professional-digital-camera",
    name: "Professional Digital Camera",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=85",
    price: 68500,
    compareAtPrice: 75000,
    rating: 4.9,
    reviewCount: 98,
    badge: "EDITOR'S PICK",
    description: "Capture memorable moments with a versatile camera built for creative photography.",
    stock: 9,
    isNewArrival: true,
    bestSeller: true,
  },
  {
    sku: "NM-006",
    slug: "smart-fitness-watch",
    name: "Smart Fitness Watch",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=85",
    price: 19500,
    compareAtPrice: 23500,
    rating: 4.5,
    reviewCount: 67,
    badge: null,
    description: "A versatile smartwatch for staying connected and keeping track of daily activities.",
    stock: 0,
    isNewArrival: false,
    bestSeller: false,
  },
  {
    sku: "NM-007",
    slug: "everyday-premium-footwear",
    name: "Everyday Premium Footwear",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=85",
    price: 9800,
    compareAtPrice: null,
    rating: 4.4,
    reviewCount: 38,
    badge: null,
    description: "Comfortable footwear with a contemporary silhouette for everyday use.",
    stock: 15,
    isNewArrival: true,
    bestSeller: false,
  },
  {
    sku: "NM-008",
    slug: "premium-camera-accessory",
    name: "Premium Camera Accessory",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=85",
    price: 8500,
    compareAtPrice: 10500,
    rating: 4.6,
    reviewCount: 51,
    badge: "SPECIAL OFFER",
    description: "A carefully selected photography accessory for enthusiasts and creative professionals.",
    stock: 21,
    isNewArrival: false,
    bestSeller: false,
  },
];

const seedProducts = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("MongoDB connected. Seeding products...");

  const migrationResult = await Product.collection.updateMany(
  {
    isNew: { $exists: true },
    isNewArrival: { $exists: false },
  },
  {
    $rename: {
      isNew: "isNewArrival",
    },
  }
);

console.log(
  `Migrated product fields: ${migrationResult.modifiedCount}`
);

  const operations = products.map((product) => ({
    updateOne: {
      filter: { sku: product.sku },
      update: {
        $setOnInsert: product,
      },
      upsert: true,
    },
  }));

  const result = await Product.bulkWrite(operations, {
    ordered: true,
  });

  console.log("Product seeding completed.");
  console.log(`Inserted: ${result.upsertedCount}`);
  console.log(`Already existing: ${result.matchedCount}`);

  const totalProducts = await Product.countDocuments();

  console.log(`Total products in database: ${totalProducts}`);
};

try {
  await seedProducts();
} catch (error) {
  console.error("Product seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
