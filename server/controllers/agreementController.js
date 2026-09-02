const Booking = require("../models/Booking");
const Property = require("../models/Property");
const User = require("../models/User");

// Generate a rental agreement for an approved booking
const getAgreement = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("property")
      .populate("tenant", "fullName email phone address");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const landlord = await User.findById(booking.property.owner).select(
      "fullName email phone address"
    );

    // Only the tenant, the landlord, or an admin may view the agreement
    const isTenant = booking.tenant._id.toString() === req.user._id.toString();
    const isLandlord = landlord._id.toString() === req.user._id.toString();
    if (!isTenant && !isLandlord && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const startDate = new Date(booking.date);
    const agreement = {
      bookingId: booking._id,
      status: booking.status,
      generatedAt: new Date().toISOString(),
      tenant: {
        fullName: booking.tenant.fullName,
        email: booking.tenant.email,
        phone: booking.tenant.phone,
        address: booking.tenant.address,
      },
      landlord: {
        fullName: landlord.fullName,
        email: landlord.email,
        phone: landlord.phone,
        address: landlord.address,
      },
      property: {
        title: booking.property.title,
        location: booking.property.location,
        city: booking.property.city,
        subCity: booking.property.subCity,
        address: booking.property.address,
        type: booking.property.propertyType,
        price: booking.property.price,
        deposit: booking.property.deposit,
      },
      terms: {
        startDate: startDate.toISOString().split("T")[0],
        monthlyRent: booking.property.price,
        deposit: booking.property.deposit,
        paymentTerms: "Rent is payable monthly in advance via Telebirr, CBE Birr, or bank transfer.",
        conditions: [
          "The tenant shall use the property for residential purposes only.",
          "The tenant shall not sublet the property without written consent.",
          "The deposit is refundable at the end of the tenancy, subject to inspection.",
          "Either party may terminate with 30 days written notice.",
        ],
      },
    };

    res.status(200).json({ success: true, agreement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAgreement };
