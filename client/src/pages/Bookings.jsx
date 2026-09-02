import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";

const statusStyles = {
  pending: "badge badge--pending",
  approved: "badge badge--approved",
  rejected: "badge badge--rejected",
  cancelled: "badge badge--cancelled",
};

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Bookings() {
  const { user } = useAuth();
  const { t } = useLang();

  const [activeTab, setActiveTab] = useState("my");
  const [myBookings, setMyBookings] = useState([]);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment modal
  const [payBooking, setPayBooking] = useState(null);
  const [payMethod, setPayMethod] = useState("");
  const [payMessage, setPayMessage] = useState("");
  const [landlordMethods, setLandlordMethods] = useState([]);
  const [payShot, setPayShot] = useState(null);
  const [payShotPreview, setPayShotPreview] = useState("");

  const loadBookings = async () => {
    try {
      const res = await API.get("/bookings/my-bookings");
      setMyBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReceived = async () => {
    try {
      const res = await API.get("/bookings/received");
      setReceivedBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([loadBookings(), loadReceived()]);
      setLoading(false);
    };
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/bookings/${id}/status`, { status });
      await Promise.all([loadBookings(), loadReceived()]);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update booking.");
    }
  };

  const openPay = async (booking) => {
    setPayBooking(booking);
    setPayMessage("");
    setPayShot(null);
    setPayShotPreview("");
    setPayMethod("");
    setLandlordMethods([]);
    try {
      const res = await API.get(
        `/payments/landlord-methods/${booking.property?.owner?._id}`
      );
      const methods = res.data.paymentMethods || [];
      setLandlordMethods(methods);
      if (methods.length > 0) setPayMethod(methods[0].type);
    } catch (err) {
      console.error(err);
    }
  };

  const closePay = () => {
    setPayBooking(null);
    setPayMessage("");
    setPayShot(null);
    setPayShotPreview("");
  };

  const handlePay = async () => {
    setPayMessage("");
    if (!payShot) {
      setPayMessage(`❌ ${t("payments.needShot")}`);
      return;
    }
    const form = new FormData();
    form.append("bookingId", payBooking._id);
    form.append("method", payMethod);
    form.append("screenshot", payShot);
    try {
      await API.post("/payments", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPayMessage("✅ " + t("payments.submitted"));
      setTimeout(closePay, 1600);
    } catch (err) {
      setPayMessage(`❌ ${err.response?.data?.message || "Payment failed."}`);
    }
  };

  if (loading) {
    return (
      <div className="page page--plain">
        <div className="container">
          <div className="loading">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--plain">
      <div className="container">
        <h1 className="page-title page-title--lg">{t("bookings.title")}</h1>

        <div className="tabs">
          <button
            onClick={() => setActiveTab("my")}
            className={`tab${activeTab === "my" ? " tab--active" : ""}`}
          >
            {t("bookings.myRequests")} ({myBookings.length})
          </button>

          {user?.role !== "tenant" && (
            <button
              onClick={() => setActiveTab("received")}
              className={`tab${activeTab === "received" ? " tab--active" : ""}`}
            >
              {t("bookings.receivedRequests")} ({receivedBookings.length})
            </button>
          )}
        </div>

        {/* ============ My Requests ============ */}
        {activeTab === "my" && (
          <div className="stack">
            {myBookings.length === 0 ? (
              <div className="empty">
                {t("bookings.none")}{" "}
                <Link to="/properties" className="link">
                  {t("bookings.browse")}
                </Link>
              </div>
            ) : (
              myBookings.map((booking) => (
                <div key={booking._id} className="list-row">
                  <div>
                    <Link
                      to={`/property/${booking.property?._id}`}
                      className="list-row__title"
                    >
                      {booking.property?.title || t("bookings.propertyRemoved")}
                    </Link>

                    <p className="list-row__meta">
                      📅 {formatDate(booking.date)}
                      {booking.time ? ` at ${booking.time}` : ""}
                    </p>

                    {booking.message && (
                      <p className="list-row__meta">"{booking.message}"</p>
                    )}

                    {booking.property?.owner && (
                      <p className="list-row__meta">
                        {t("bookings.owner")}: {booking.property.owner.fullName}
                        {booking.property.owner.phone &&
                          ` · ${booking.property.owner.phone}`}
                      </p>
                    )}
                  </div>

                  <div className="list-row__actions">
                    <span className={statusStyles[booking.status]}>
                      {t(`status.${booking.status}`)}
                    </span>

                    {["pending", "approved"].includes(booking.status) && (
                      <button
                        onClick={() => updateStatus(booking._id, "cancelled")}
                        className="btn btn--danger btn--sm"
                      >
                        {t("bookings.cancel")}
                      </button>
                    )}

                    {booking.status === "approved" && (
                      <button
                        onClick={() => openPay(booking)}
                        className="btn btn--primary btn--sm"
                      >
                        💳 {t("payments.payNow")}
                      </button>
                    )}

                    {booking.status === "approved" && (
                      <Link
                        to={`/agreement/${booking._id}`}
                        className="btn btn--outline btn--sm"
                      >
                        📄 {t("agreement.view")}
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ============ Received Requests (landlord) ============ */}
        {activeTab === "received" && (
          <div className="stack">
            {receivedBookings.length === 0 ? (
              <div className="empty">{t("bookings.noneReceived")}</div>
            ) : (
              receivedBookings.map((booking) => (
                <div key={booking._id} className="list-row">
                  <div>
                    <Link
                      to={`/property/${booking.property?._id}`}
                      className="list-row__title"
                    >
                      {booking.property?.title || t("bookings.propertyRemoved")}
                    </Link>

                    <p className="list-row__meta">
                      📅 {formatDate(booking.date)}
                      {booking.time ? ` at ${booking.time}` : ""}
                    </p>

                    <p className="list-row__meta">
                      {t("bookings.requestedBy")}: {booking.tenant?.fullName}
                      {booking.tenant?.phone && ` · ${booking.tenant.phone}`}
                      {booking.tenant?.email && ` · ${booking.tenant.email}`}
                    </p>

                    {booking.message && (
                      <p className="list-row__meta">"{booking.message}"</p>
                    )}
                  </div>

                  <div className="list-row__actions">
                    <span className={statusStyles[booking.status]}>
                      {t(`status.${booking.status}`)}
                    </span>

                    {booking.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(booking._id, "approved")}
                          className="btn btn--success btn--sm"
                        >
                          {t("bookings.approve")}
                        </button>

                        <button
                          onClick={() => updateStatus(booking._id, "rejected")}
                          className="btn btn--danger btn--sm"
                        >
                          {t("bookings.reject")}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ============ Payment Modal ============ */}
        {payBooking && (
          <div className="modal-overlay">
            <div className="modal">
              <h2 className="modal__title">{t("payments.title")}</h2>

              <p className="soft">{payBooking.property?.title}</p>
              <p className="details-price" style={{ marginTop: 6, marginBottom: 16 }}>
                ETB {payBooking.property?.price}
              </p>

              <label className="label" style={{ marginBottom: 8, display: "block" }}>
                {t("payments.method")}
              </label>

              {landlordMethods.length === 0 ? (
                <p className="soft" style={{ marginBottom: 16 }}>
                  {t("payments.noMethods")}
                </p>
              ) : (
                <div className="pay-methods" style={{ marginBottom: 16 }}>
                  {landlordMethods.map((m, i) => (
                    <label
                      key={i}
                      className={`pay-method${
                        payMethod === m.type ? " pay-method--active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="payMethod"
                        value={m.type}
                        checked={payMethod === m.type}
                        onChange={() => setPayMethod(m.type)}
                      />
                      <span className="pay-method__name">
                        {m.label || m.type}
                      </span>
                      {m.accountName && (
                        <span className="pay-method__meta">{m.accountName}</span>
                      )}
                      {m.accountNumber && (
                        <span className="pay-method__meta">
                          {m.accountNumber}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}

              <label className="label" style={{ marginBottom: 8, display: "block" }}>
                {t("payments.uploadShot")}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files[0];
                  setPayShot(f || null);
                  setPayShotPreview(f ? URL.createObjectURL(f) : "");
                }}
                className="input"
                style={{ marginBottom: 12 }}
              />
              {payShotPreview && (
                <img
                  src={payShotPreview}
                  alt="payment proof"
                  className="pay-shot-preview"
                  style={{ marginBottom: 12 }}
                />
              )}

              {payMessage && <p style={{ marginBottom: 12 }}>{payMessage}</p>}

              <div className="modal__actions">
                <button
                  onClick={handlePay}
                  disabled={landlordMethods.length === 0}
                  className="btn btn--primary"
                >
                  {t("payments.submitProof")}
                </button>
                <button onClick={closePay} className="btn btn--outline">
                  {t("payments.cancel")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
