
import mongoose from "mongoose";

const shippingZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    province: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    area: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Delivery fee must be a valid whole number.",
      },
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

shippingZoneSchema.index(
  {
    city: 1,
    province: 1,
    area: 1,
  },
  {
    unique: true,
    name: "unique_shipping_zone_location",
  }
);

shippingZoneSchema.index({
  isActive: 1,
  city: 1,
  province: 1,
});

const ShippingZone = mongoose.model(
  "ShippingZone",
  shippingZoneSchema
);

export default ShippingZone;
