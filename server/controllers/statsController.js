const User = require("../models/User");
const Property = require("../models/Property");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Favorite = require("../models/Favorite");

// Personal dashboard stats for the logged-in user
const getMyStats = async (req, res) => {
  try {
    const [favoritesCount, myBookingsCount, myReviewsCount, myProperties] =
      await Promise.all([
        Favorite.countDocuments({ user: req.user._id }),
        Booking.countDocuments({ tenant: req.user._id }),
        Review.countDocuments({ user: req.user._id }),
        Property.find({ owner: req.user._id }).select("_id"),
      ]);

    const propertyIds = myProperties.map((p) => p._id);

    const [myPropertiesCount, receivedBookingsCount] = await Promise.all([
      Property.countDocuments({ owner: req.user._id }),
      Booking.countDocuments({
        property: { $in: propertyIds },
        status: "pending",
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        favorites: favoritesCount,
        myBookings: myBookingsCount,
        myReviews: myReviewsCount,
        myProperties: myPropertiesCount,
        pendingRequests: receivedBookingsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin overview stats
const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalLandlords,
      totalProperties,
      activeProperties,
      totalBookings,
      pendingBookings,
      totalReviews,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "landlord" }),
      Property.countDocuments(),
      Property.countDocuments({ status: "active" }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Review.countDocuments(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("fullName email role createdAt"),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalLandlords,
        totalProperties,
        activeProperties,
        totalBookings,
        pendingBookings,
        totalReviews,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyStats,
  getAdminStats,
};
