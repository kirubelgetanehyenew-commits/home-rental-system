const Review = require("../models/Review");
const Property = require("../models/Property");

// Get reviews for a property (with rating summary)
const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate("user", "fullName profileImage")
      .sort({ createdAt: -1 });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add or update my review for a property
const upsertReview = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot review your own property",
      });
    }

    const review = await Review.findOneAndUpdate(
      { property: propertyId, user: req.user._id },
      { rating, comment },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Review saved successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete my review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this review",
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPropertyReviews,
  upsertReview,
  deleteReview,
};
