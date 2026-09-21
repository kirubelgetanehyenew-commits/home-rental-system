import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";
import MapView from "../components/MapView";

function StarRating({ value, onChange }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={onChange ? () => onChange(star) : undefined}
          className={`star-rating__star${onChange ? " star-rating__star--btn" : ""}`}
        >
          {star <= value ? "⭐" : "☆"}
        </button>
      ))}
    </div>
  );
}

export default function PropertyDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLang();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Favorites
  const [favorited, setFavorited] = useState(false);

  // Booking
  const [bookingForm, setBookingForm] = useState({
    date: "",
    time: "",
    message: "",
  });
  const [bookingMessage, setBookingMessage] = useState("");

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  // Report property
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportMessage, setReportMessage] = useState("");

  // Contact owner (message)
  const [showContact, setShowContact] = useState(false);
  const [contactText, setContactText] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const isOwner = user && property && user.id === property.owner?._id;
  const canInteract = user && !isOwner;

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const res = await API.get(`/properties/${id}`);
        setProperty(res.data.property);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const loadReviews = async () => {
      try {
        const res = await API.get(`/reviews/property/${id}`);
        setReviews(res.data.reviews);
        setAverageRating(res.data.averageRating);

        if (user) {
          const myReview = res.data.reviews.find(
            (r) => r.user?._id === user.id
          );
          if (myReview) {
            setMyRating(myReview.rating);
            setMyComment(myReview.comment);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadProperty();
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Check favorite status
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const res = await API.get("/favorites/ids");
        setFavorited(res.data.favoritedIds.includes(id));
      } catch (err) {
        // Not logged in or request failed
      }
    };

    if (user) checkFavorite();
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) return;

    try {
      const res = await API.post(`/favorites/${id}`);
      setFavorited(res.data.favorited);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingMessage("");

    try {
      await API.post("/bookings", {
        propertyId: id,
        date: bookingForm.date,
        time: bookingForm.time,
        message: bookingForm.message,
      });

      setBookingMessage("✅ " + t("details.sendRequest"));
      setBookingForm({ date: "", time: "", message: "" });
    } catch (err) {
      setBookingMessage(
        `❌ ${err.response?.data?.message || "Failed to send request."}`
      );
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMessage("");

    try {
      await API.post(`/reviews/property/${id}`, {
        rating: myRating,
        comment: myComment,
      });

      setReviewMessage("✅");
      const res = await API.get(`/reviews/property/${id}`);
      setReviews(res.data.reviews);
      setAverageRating(res.data.averageRating);
    } catch (err) {
      setReviewMessage(
        `❌ ${err.response?.data?.message || "Failed to save review."}`
      );
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await API.delete(`/reviews/${reviewId}`);
      const res = await API.get(`/reviews/property/${id}`);
      setReviews(res.data.reviews);
      setAverageRating(res.data.averageRating);
      setMyRating(0);
      setMyComment("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    setReportMessage("");
    try {
      await API.post("/reports", {
        property: id,
        reason: reportReason,
        description: reportDescription,
      });
      setReportMessage("✅ " + t("details.reportSuccess"));
      setReportReason("");
      setReportDescription("");
      setShowReport(false);
    } catch (err) {
      setReportMessage(
        `❌ ${err.response?.data?.message || "Failed to submit report."}`
      );
    }
  };

  const handleContact = async (e) => {
    e.preventDefault();
    setContactMessage("");
    try {
      await API.post("/messages", {
        property: id,
        recipient: property.owner._id,
        content: contactText,
      });
      setContactMessage("✅ " + t("details.messageSent"));
      setContactText("");
      setShowContact(false);
    } catch (err) {
      setContactMessage(
        `❌ ${err.response?.data?.message || "Failed to send message."}`
      );
    }
  };

  if (loading) {
    return (
      <div className="page page--details">
        <div className="container">
          <div className="loading">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="page page--details">
        <div className="container">
          <div className="empty">{t("details.notFound")}</div>
        </div>
      </div>
    );
  }

  const images =
    property.images && property.images.length > 0
      ? property.images
      : ["https://placehold.co/1200x500?text=Property+Image"];

  return (
    <div className="page page--details">
      <div className="container">
        {/* Image gallery */}
        <div className="pd-gallery">
          <img
            src={images[activeImage]}
            alt={property.title}
            className="gallery__main"
          />
          <span className="pd-gallery__count">
            {activeImage + 1} / {images.length}
          </span>
        </div>

        {images.length > 1 && (
          <div className="gallery__thumbs">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`View ${index + 1}`}
                onClick={() => setActiveImage(index)}
                className={`thumb${index === activeImage ? " thumb--active" : ""}`}
              />
            ))}
          </div>
        )}

        <div className="details-head">
          <div>
            <h1 className="details-title">{property.title}</h1>

            <p className="property-card__location" style={{ marginTop: 8 }}>
              📍 {property.location}
            </p>

            {property.propertyType && (
              <span className="badge badge--brand" style={{ marginTop: 10 }}>
                {t(`type.${property.propertyType}`)}
              </span>
            )}
          </div>

          {user && (
            <button onClick={handleToggleFavorite} className="btn btn--outline">
              {favorited ? `❤️ ${t("details.saved")}` : `🤍 ${t("details.save")}`}
            </button>
          )}
        </div>

        {averageRating > 0 && (
          <p className="pd-rating">
            ⭐ {averageRating} · {reviews.length} {t("details.reviews")}
          </p>
        )}

        <p className="details-price">
          ETB {property.price}
          <small> {t("details.perMonth")}</small>
        </p>

        <div className="details-stats">
          <div className="detail-stat">
            <span className="detail-stat__icon">🛏</span>
            <p className="detail-stat__label">{t("details.bedrooms")}</p>
            <p className="detail-stat__value">{property.bedrooms}</p>
          </div>

          <div className="detail-stat">
            <span className="detail-stat__icon">🛁</span>
            <p className="detail-stat__label">{t("details.bathrooms")}</p>
            <p className="detail-stat__value">{property.bathrooms}</p>
          </div>

          <div className="detail-stat">
            <span className="detail-stat__icon">📐</span>
            <p className="detail-stat__label">{t("details.area")}</p>
            <p className="detail-stat__value">{property.area} m²</p>
          </div>
        </div>

        <div className="section">
          <h2 className="section__title">{t("details.description")}</h2>
          <p className="soft">{property.description}</p>
        </div>

        {/* Amenities */}
        {(property.amenities?.length > 0 || property.furnished || property.parking) && (
          <div className="section">
            <h2 className="section__title">{t("details.amenities")}</h2>

            <div className="row row--wrap">
              {[
                property.furnished && t("amenity.Furnished"),
                property.parking && t("amenity.Parking"),
                property.internet && t("amenity.Internet"),
                property.balcony && t("amenity.Balcony"),
                property.garden && t("amenity.Garden"),
                property.swimmingPool && t("amenity.Swimming Pool"),
                property.security && t("amenity.Security"),
                property.petAllowed && t("amenity.Pets Allowed"),
                ...(property.amenities || []),
              ]
                .filter(Boolean)
                .map((amenity) => (
                  <span key={amenity} className="amenity-chip">
                    ✓ {amenity}
                  </span>
                ))}
            </div>
          </div>
        )}

        <div className="card section">
          <h2 className="section__title">{t("details.ownerInfo")}</h2>

          <p>
            <strong>{t("details.name")}:</strong> {property.owner.fullName}
            {property.owner.isVerified && (
              <span className="badge badge--verified" style={{ marginLeft: 8 }}>
                ✓ {t("details.verified")}
              </span>
            )}
          </p>

          <p><strong>{t("details.email")}:</strong> {property.owner.email}</p>

          <p><strong>{t("details.phone")}:</strong> {property.owner.phone}</p>

          {canInteract && (
            <div className="row row--wrap" style={{ marginTop: 16 }}>
              <button onClick={() => setShowContact((s) => !s)} className="btn btn--primary btn--sm">
                ✉️ {t("details.contactOwner")}
              </button>
              <button onClick={() => setShowReport((s) => !s)} className="btn btn--danger-outline btn--sm">
                🚩 {t("details.report")}
              </button>
            </div>
          )}

          {contactMessage && <p style={{ marginTop: 12 }}>{contactMessage}</p>}
          {reportMessage && <p style={{ marginTop: 12 }}>{reportMessage}</p>}

          {showContact && canInteract && (
            <form onSubmit={handleContact} className="form" style={{ marginTop: 16 }}>
              <textarea
                rows="3"
                required
                value={contactText}
                onChange={(e) => setContactText(e.target.value)}
                placeholder={t("details.contactPlaceholder")}
                className="textarea"
              />
              <button className="btn btn--primary">
                {t("details.send")}
              </button>
            </form>
          )}

          {showReport && canInteract && (
            <form onSubmit={handleReport} className="form" style={{ marginTop: 16 }}>
              <select
                required
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="select"
              >
                <option value="">{t("details.selectReason")}</option>
                <option value="Fake property">{t("details.reasonFake")}</option>
                <option value="Incorrect information">{t("details.reasonIncorrect")}</option>
                <option value="Fraudulent landlord">{t("details.reasonFraud")}</option>
                <option value="Scam">{t("details.reasonScam")}</option>
                <option value="Inappropriate content">{t("details.reasonInappropriate")}</option>
                <option value="Other">{t("details.reasonOther")}</option>
              </select>
              <textarea
                rows="3"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder={t("details.reportPlaceholder")}
                className="textarea"
              />
              <button className="btn btn--danger">
                {t("details.submitReport")}
              </button>
            </form>
          )}
        </div>

        {/* ============ Map location ============ */}
        {property.latitude != null && property.longitude != null && (
          <div className="section">
            <h2 className="section__title">{t("details.mapLocation")}</h2>
            <div className="map-wrap">
              <MapView
                latitude={property.latitude}
                longitude={property.longitude}
                title={property.title}
              />
            </div>
          </div>
        )}

        {/* ============ Request a Viewing ============ */}
        {canInteract && (
          <div className="card section">
            <h2 className="section__title">{t("details.requestViewing")}</h2>

            {bookingMessage && (
              <div className="alert alert--info" style={{ marginBottom: 16 }}>
                {bookingMessage}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="form">
              <div className="grid grid--2">
                <input
                  type="date"
                  required
                  value={bookingForm.date}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, date: e.target.value })
                  }
                  className="input"
                />

                <input
                  type="time"
                  value={bookingForm.time}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, time: e.target.value })
                  }
                  className="input"
                />
              </div>

              <textarea
                placeholder={t("details.messagePlaceholder")}
                rows="3"
                value={bookingForm.message}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, message: e.target.value })
                }
                className="textarea"
              />

              <button className="btn btn--primary">
                {t("details.sendRequest")}
              </button>
            </form>
          </div>
        )}

        {isOwner && (
          <div className="alert alert--info section">
            {t("details.ownProperty")}{" "}
            <Link to={`/edit-property/${property._id}`} className="link">
              {t("details.editIt")}
            </Link>{" "}
            {t("details.orManage")}{" "}
            <Link to="/bookings" className="link">
              {t("details.bookingsPage")}
            </Link>
            .
          </div>
        )}

        {/* ============ Reviews ============ */}
        <div className="section">
          <h2 className="section__title">
            {t("details.reviews")} ({reviews.length})
          </h2>

          {canInteract && (
            <form onSubmit={handleReviewSubmit} className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 12 }}>{t("details.writeReview")}</h3>

              {reviewMessage && (
                <div className="alert alert--info" style={{ marginBottom: 12 }}>
                  {reviewMessage}
                </div>
              )}

              <StarRating value={myRating} onChange={setMyRating} />

              <textarea
                placeholder={t("details.reviewPlaceholder")}
                rows="3"
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                className="textarea"
                style={{ marginTop: 12 }}
              />

              <button
                disabled={!myRating}
                className="btn btn--primary"
                style={{ marginTop: 12 }}
              >
                {t("details.submitReview")}
              </button>
            </form>
          )}

          {!user && (
            <p className="soft" style={{ marginBottom: 24 }}>
              <Link to="/login" className="link">
                {t("details.loginTo")}
              </Link>{" "}
              {t("details.loginToDesc")}
            </p>
          )}

          {reviews.length === 0 ? (
            <p className="soft">{t("details.noReviews")}</p>
          ) : (
            <div className="stack">
              {reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-card__head">
                    <div className="review-card__author">
                      {review.user?.profileImage ? (
                        <img
                          src={review.user.profileImage}
                          alt={review.user.fullName}
                          className="avatar avatar--lg"
                        />
                      ) : (
                        <div className="avatar avatar--lg">
                          {review.user?.fullName?.[0] || "?"}
                        </div>
                      )}

                      <div>
                        <p style={{ fontWeight: 700 }}>
                          {review.user?.fullName || "User"}
                        </p>
                        <p className="muted" style={{ fontSize: 12 }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="row row--center">
                      <StarRating value={review.rating} />

                      {user?.id === review.user?._id && (
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="btn btn--danger-outline btn--sm"
                        >
                          {t("details.delete")}
                        </button>
                      )}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="soft" style={{ marginTop: 12 }}>
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
