const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, bio, profileImage } = req.body;

    if (fullName) req.user.fullName = fullName;
    if (phone) req.user.phone = phone;
    if (address) req.user.address = address;
    if (bio) req.user.bio = bio;
    if (profileImage) req.user.profileImage = profileImage;

    await req.user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }
    const uploadsDir = path.join(__dirname, "..", "uploads");
    const originalPath = req.file.path;

    // Create resized filename
    const ext = ".jpg";
    const resizedFilename = `avatar_${req.user._id}_${Date.now()}${ext}`;
    const resizedPath = path.join(uploadsDir, resizedFilename);

    // Resize and convert to jpeg
      // Remove previous avatar file if present
      if (req.user.profileImage && req.user.profileImage.startsWith("/uploads/")) {
        try {
          const oldPath = path.join(__dirname, "..", req.user.profileImage);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        } catch (err) {
          console.warn("Failed to remove previous avatar:", err.message);
        }
      }

      await sharp(originalPath)
      .resize(300, 300, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toFile(resizedPath);

    // Remove original uploaded file if different
    if (originalPath !== resizedPath) {
      fs.unlink(originalPath, (err) => {
        if (err) console.warn("Failed to remove original upload:", err.message);
      });
    }

    const avatarPath = "/uploads/" + resizedFilename;
    req.user.profileImage = avatarPath;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: "Avatar uploaded and resized",
      profileImage: avatarPath,
      user: req.user,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAvatar = async (req, res) => {
  try {
    if (req.user.profileImage && req.user.profileImage.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "..", req.user.profileImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    req.user.profileImage = "";
    await req.user.save();

    res.status(200).json({ success: true, message: "Avatar removed", user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
};