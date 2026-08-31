const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const {
  createProperty,
  getProperties,
  getProperty,
  getMyProperties,
  getAllPropertiesAdmin,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* ===========================
   Public Routes
=========================== */

// Get all properties
router.get("/", getProperties);

// Get logged-in user's properties
router.get("/my-properties", protect, getMyProperties);

// Admin: get all properties
router.get("/admin", protect, authorizeRoles("admin"), getAllPropertiesAdmin);

// Get single property
router.get("/:id", getProperty);

/* ===========================
   Image Upload
=========================== */

router.post(
  "/upload",
  protect,
  upload.array("images", 5),
  (req, res) => {
    const imagePaths = req.files.map(
      (file) => "/uploads/" + file.filename
    );

    res.status(200).json({
      success: true,
      images: imagePaths,
    });
  }
);

/* ===========================
   Protected Routes
=========================== */

// Create property
router.post("/", protect, createProperty);

// Update property
router.put("/:id", protect, updateProperty);

// Delete property
router.delete("/:id", protect, deleteProperty);

module.exports = router;