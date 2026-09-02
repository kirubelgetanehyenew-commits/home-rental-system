const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createPayment,
  getMyPayments,
  getReceivedPayments,
  approvePayment,
  rejectPayment,
  getMyPaymentMethods,
  updateMyPaymentMethods,
  getLandlordPaymentMethods,
} = require("../controllers/paymentController");

const router = express.Router();

router.use(protect);

// Tenant submits payment proof (screenshot) for an approved booking
router.post("/", upload.single("screenshot"), createPayment);

router.get("/my-payments", getMyPayments);
router.get("/received", getReceivedPayments);

// Landlord payment-method configuration
router.get("/my-methods", getMyPaymentMethods);
router.put("/my-methods", updateMyPaymentMethods);
router.get("/landlord-methods/:landlordId", getLandlordPaymentMethods);

// Landlord approval workflow
router.put("/:id/approve", approvePayment);
router.put("/:id/reject", rejectPayment);

module.exports = router;
