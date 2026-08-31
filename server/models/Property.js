const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    propertyType: {
      type: String,
      enum: ["Apartment", "Villa", "House", "Studio", "Condominium", "Office", "Commercial Space", "Hostel", "Shared Room", "Guest House"],
      default: "Apartment",
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    deposit: {
      type: Number,
      default: 0,
    },

    bedrooms: {
      type: Number,
      default: 0,
    },

    bathrooms: {
      type: Number,
      default: 0,
    },

    kitchens: {
      type: Number,
      default: 0,
    },

    livingRooms: {
      type: Number,
      default: 0,
    },

    area: {
      type: Number,
      default: 0,
    },

    floorNumber: {
      type: Number,
      default: 0,
    },

    totalFloors: {
      type: Number,
      default: 0,
    },

    city: {
      type: String,
      default: "",
    },

    subCity: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },

    furnished: {
      type: Boolean,
      default: false,
    },

    parking: {
      type: Boolean,
      default: false,
    },

    internet: {
      type: Boolean,
      default: false,
    },

    balcony: {
      type: Boolean,
      default: false,
    },

    garden: {
      type: Boolean,
      default: false,
    },

    swimmingPool: {
      type: Boolean,
      default: false,
    },

    security: {
      type: Boolean,
      default: false,
    },

    petAllowed: {
      type: Boolean,
      default: false,
    },

    waterSupply: {
      type: Boolean,
      default: true,
    },

    electricity: {
      type: Boolean,
      default: true,
    },

    amenities: [
      {
        type: String,
      },
    ],

    images: [
      {
        type: String,
      },
    ],

    videos: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },

    available: {
      type: Boolean,
      default: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Property", propertySchema);