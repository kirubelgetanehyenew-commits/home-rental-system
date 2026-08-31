const Favorite = require("../models/Favorite");
const Property = require("../models/Property");

// Get my favorites
const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: "property",
        populate: { path: "owner", select: "fullName email phone" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle favorite for a property
const toggleFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    const existing = await Favorite.findOne({
      user: req.user._id,
      property: propertyId,
    });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({
        success: true,
        message: "Removed from favorites",
        favorited: false,
      });
    }

    await Favorite.create({ user: req.user._id, property: propertyId });

    res.status(201).json({
      success: true,
      message: "Added to favorites",
      favorited: true,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check which of the given property ids are favorited by the user
const getFavoritedIds = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).select(
      "property"
    );

    res.status(200).json({
      success: true,
      favoritedIds: favorites.map((f) => f.property.toString()),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyFavorites,
  toggleFavorite,
  getFavoritedIds,
};
