
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
            trim: true,
          },
          publicId: {
            type: String,
            required: true,
            trim: true,
          },
          _id: false,
        },
      ],
      default: [],
      validate: {
        validator: (images) => images.length <= 8,
        message: "A product can have a maximum of 8 images.",
      },
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    badge: {
      type: String,
      default: null,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number.",
      },
    },
   isNewArrival: {
  type: Boolean,
  default: false,
},
    bestSeller: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
