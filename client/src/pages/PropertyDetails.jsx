import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white p-3 text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100 dark:placeholder:text-zinc-500";

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={onChange ? () => onChange(star) : undefined}
          className={`text-2xl transition ${
            onChange ? "hover:scale-125 cursor-pointer" : "cursor-default"
          }`}
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

  if (loading) {
    return (
      <div className="text-center mt-20 text-xl">
        {t("common.loading")}
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center mt-20 text-xl">
        {t("details.notFound")}
      </div>
    );
  }

  const images =
    property.images && property.images.length > 0
      ? property.images
      : ["https://placehold.co/1200x500?text=Property+Image"];

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">

      {/* Image gallery */}
      <img
        src={images[activeImage]}
        alt={property.title}
        className="w-full h-96 object-cover rounded-lg shadow"
      />

      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`View ${index + 1}`}
              onClick={() => setActiveImage(index)}
              className={`h-20 w-28 object-cover rounded cursor-pointer border-2 ${
                index === activeImage
                  ? "border-orange-500"
                  : "border-transparent"
              }`}
            />
          ))}
        </div>
      )}

      <div className="mt-8">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">
              {property.title}
            </h1>

            <p className="text-stone-500 mt-2 dark:text-zinc-400">
              📍 {property.location}
            </p>

            {property.propertyType && (
              <span className="inline-block mt-2 rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-600 dark:bg-zinc-800 dark:text-zinc-300">
                {t(`type.${property.propertyType}`)}
              </span>
            )}
          </div>

          {user && (
            <button
              onClick={handleToggleFavorite}
              className="flex items-center gap-2 rounded-full border border-stone-300 px-5 py-2 font-semibold transition hover:border-rose-400 hover:bg-rose-50 dark:border-zinc-700 dark:hover:border-rose-500 dark:hover:bg-rose-500/10"
            >
              {favorited ? `❤️ ${t("details.saved")}` : `🤍 ${t("details.save")}`}
            </button>
          )}
        </div>

        {averageRating > 0 && (
          <p className="mt-3 text-lg">
            ⭐ {averageRating} · {reviews.length} {t("details.reviews")}
          </p>
        )}

        <p className="text-orange-600 text-3xl font-bold mt-4 dark:text-orange-400">
          ETB {property.price}
          <span className="text-base font-normal text-stone-500 dark:text-zinc-400">
            {" "}{t("details.perMonth")}
          </span>
        </p>

        <div className="grid grid-cols-3 gap-6 mt-8">

          <div className="bg-white shadow rounded p-4 dark:bg-zinc-900">
            <h3 className="font-bold">{t("details.bedrooms")}</h3>
            <p>{property.bedrooms}</p>
          </div>

          <div className="bg-white shadow rounded p-4 dark:bg-zinc-900">
            <h3 className="font-bold">{t("details.bathrooms")}</h3>
            <p>{property.bathrooms}</p>
          </div>

          <div className="bg-white shadow rounded p-4 dark:bg-zinc-900">
            <h3 className="font-bold">{t("details.area")}</h3>
            <p>{property.area} m²</p>
          </div>

        </div>

        <div className="mt-8">

          <h2 className="text-2xl font-bold mb-3">
            {t("details.description")}
          </h2>

          <p className="text-stone-700 dark:text-zinc-300">
            {property.description}
          </p>

        </div>

        {/* Amenities */}
        {(property.amenities?.length > 0 || property.furnished || property.parking) && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-3">{t("details.amenities")}</h2>

            <div className="flex flex-wrap gap-2">
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
                  <span
                    key={amenity}
                    className="rounded-full bg-orange-50 text-orange-700 px-4 py-1 text-sm font-semibold dark:bg-orange-500/10 dark:text-orange-300"
                  >
                    ✓ {amenity}
                  </span>
                ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-stone-100 rounded-lg p-6 dark:bg-zinc-900">

          <h2 className="text-2xl font-bold mb-3">
            {t("details.ownerInfo")}
          </h2>

          <p><strong>{t("details.name")}:</strong> {property.owner.fullName}</p>

          <p><strong>{t("details.email")}:</strong> {property.owner.email}</p>

          <p><strong>{t("details.phone")}:</strong> {property.owner.phone}</p>

        </div>

        {/* ============ Request a Viewing ============ */}
        {canInteract && (
          <div className="mt-8 bg-orange-50 rounded-lg p-6 dark:bg-orange-500/10">

            <h2 className="text-2xl font-bold mb-4">
              {t("details.requestViewing")}
            </h2>

            {bookingMessage && (
              <div className="mb-4 p-3 bg-white rounded dark:bg-zinc-900">
                {bookingMessage}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="date"
                  required
                  value={bookingForm.date}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, date: e.target.value })
                  }
                  className={inputClass}
                />

                <input
                  type="time"
                  value={bookingForm.time}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, time: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <textarea
                placeholder={t("details.messagePlaceholder")}
                rows="3"
                value={bookingForm.message}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, message: e.target.value })
                }
                className={inputClass}
              />

              <button className="bg-orange-500 text-white px-6 py-3 rounded font-semibold hover:bg-orange-600">
                {t("details.sendRequest")}
              </button>
            </form>
          </div>
        )}

        {isOwner && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 dark:bg-yellow-500/10 dark:border-yellow-500/30">
            <p className="text-yellow-800 dark:text-yellow-300">
              {t("details.ownProperty")}{" "}
              <Link
                to={`/edit-property/${property._id}`}
                className="font-semibold underline"
              >
                {t("details.editIt")}
              </Link>{" "}
              {t("details.orManage")}{" "}
              <Link to="/bookings" className="font-semibold underline">
                {t("details.bookingsPage")}
              </Link>
              .
            </p>
          </div>
        )}

        {/* ============ Reviews ============ */}
        <div className="mt-8">

          <h2 className="text-2xl font-bold mb-4">
            {t("details.reviews")} ({reviews.length})
          </h2>

          {canInteract && (
            <form
              onSubmit={handleReviewSubmit}
              className="bg-stone-100 rounded-lg p-6 mb-6 dark:bg-zinc-900"
            >
              <h3 className="font-bold mb-3">{t("details.writeReview")}</h3>

              {reviewMessage && (
                <div className="mb-3 p-2 bg-white rounded text-sm dark:bg-zinc-950">
                  {reviewMessage}
                </div>
              )}

              <StarRating value={myRating} onChange={setMyRating} />

              <textarea
                placeholder={t("details.reviewPlaceholder")}
                rows="3"
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                className={`${inputClass} mt-3`}
              />

              <button
                disabled={!myRating}
                className="mt-3 bg-orange-500 text-white px-5 py-2 rounded font-semibold hover:bg-orange-600 disabled:opacity-50"
              >
                {t("details.submitReview")}
              </button>
            </form>
          )}

          {!user && (
            <p className="text-stone-500 mb-6 dark:text-zinc-400">
              <Link
                to="/login"
                className="text-orange-600 hover:underline dark:text-orange-400"
              >
                {t("details.loginTo")}
              </Link>{" "}
              {t("details.loginToDesc")}
            </p>
          )}

          {reviews.length === 0 ? (
            <p className="text-stone-500 dark:text-zinc-400">
              {t("details.noReviews")}
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white shadow rounded-lg p-5 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {review.user?.profileImage ? (
                        <img
                          src={review.user.profileImage}
                          alt={review.user.fullName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                          {review.user?.fullName?.[0] || "?"}
                        </div>
                      )}

                      <div>
                        <p className="font-semibold">
                          {review.user?.fullName || "User"}
                        </p>
                        <p className="text-xs text-stone-400 dark:text-zinc-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StarRating value={review.rating} />

                      {user?.id === review.user?._id && (
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-500 text-sm hover:underline"
                        >
                          {t("details.delete")}
                        </button>
                      )}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-stone-700 mt-3 dark:text-zinc-300">
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
