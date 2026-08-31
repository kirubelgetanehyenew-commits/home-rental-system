const Property = require("../models/Property");

// Create Property
const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      propertyType,
      category,
      price,
      deposit,
      bedrooms,
      bathrooms,
      kitchens,
      livingRooms,
      area,
      floorNumber,
      totalFloors,
      city,
      subCity,
      address,
      latitude,
      longitude,
      furnished,
      parking,
      internet,
      balcony,
      garden,
      swimmingPool,
      security,
      petAllowed,
      waterSupply,
      electricity,
      amenities,
      images,
      videos,
      status,
    } = req.body;

    const property = await Property.create({
      title,
      description,
      propertyType,
      category,
      price,
      deposit,
      bedrooms,
      bathrooms,
      kitchens,
      livingRooms,
      area,
      floorNumber,
      totalFloors,
      city,
      subCity,
      address,
      latitude,
      longitude,
      furnished,
      parking,
      internet,
      balcony,
      garden,
      swimmingPool,
      security,
      petAllowed,
      waterSupply,
      electricity,
      amenities: Array.isArray(amenities)
        ? amenities
        : typeof amenities === "string"
        ? amenities.split(",").map((item) => item.trim()).filter(Boolean)
        : [],
      images: Array.isArray(images) ? images : images ? [images] : [],
      videos: Array.isArray(videos) ? videos : videos ? [videos] : [],
      status: status || "active",
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Properties (with search, filters, sort & pagination)
const getProperties = async (req, res) => {
  try {
    const query = { status: "active" };

    if (req.query.city) {
      query.city = req.query.city;
    }

    if (req.query.propertyType) {
      query.propertyType = req.query.propertyType;
    }

    // Keyword search across title, description, location, city, address
    if (req.query.keyword) {
      const keywordRegex = new RegExp(req.query.keyword.trim(), "i");
      query.$or = [
        { title: keywordRegex },
        { description: keywordRegex },
        { location: keywordRegex },
        { city: keywordRegex },
        { address: keywordRegex },
      ];
    }

    // Price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Minimum bedrooms / bathrooms
    if (req.query.minBedrooms) {
      query.bedrooms = { $gte: Number(req.query.minBedrooms) };
    }

    if (req.query.minBathrooms) {
      query.bathrooms = { $gte: Number(req.query.minBathrooms) };
    }

    // Boolean amenities
    ["furnished", "parking", "internet", "petAllowed"].forEach((field) => {
      if (req.query[field] === "true") {
        query[field] = true;
      }
    });

    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sort === "price_asc") sort = { price: 1 };
    if (req.query.sort === "price_desc") sort = { price: -1 };
    if (req.query.sort === "newest") sort = { createdAt: -1 };
    if (req.query.sort === "oldest") sort = { createdAt: 1 };

    // Pagination
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 9, 1), 50);
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate("owner", "fullName email phone")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Property.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Property
const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "owner",
      "fullName email phone"
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Property
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check ownership
    if (
      property.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this property",
      });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        amenities: Array.isArray(req.body.amenities)
          ? req.body.amenities
          : typeof req.body.amenities === "string"
          ? req.body.amenities.split(",").map((item) => item.trim()).filter(Boolean)
          : undefined,
        images: Array.isArray(req.body.images)
          ? req.body.images
          : req.body.images
          ? [req.body.images]
          : undefined,
        videos: Array.isArray(req.body.videos)
          ? req.body.videos
          : req.body.videos
          ? [req.body.videos]
          : undefined,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Property
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check ownership
    if (
      property.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this property",
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get My Properties
const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      owner: req.user._id,
    }).populate("owner", "fullName email phone");

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

  // Admin: Get all properties (including inactive)
  const getAllPropertiesAdmin = async (req, res) => {
    try {
      const properties = await Property.find({}).populate("owner", "fullName email phone");
      res.status(200).json({ success: true, count: properties.length, properties });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
module.exports = {
  createProperty,
  getProperties,
  getProperty,
  getMyProperties,
  updateProperty,
  deleteProperty,
  getAllPropertiesAdmin,
};
