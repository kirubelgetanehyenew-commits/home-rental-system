const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", getProperties);
router.get("/:id", getProperty);
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

// Protected
router.post("/", protect, createProperty);
router.put("/:id", protect, updateProperty);
router.delete("/:id", protect, deleteProperty);

module.exports = router;