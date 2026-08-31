import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  cancelled: "bg-stone-200 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300",
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

  if (loading) {
    return (
      <div className="text-center mt-20 text-xl">{t("common.loading")}</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">

      <h1 className="text-4xl font-bold mb-8">{t("bookings.title")}</h1>

      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={() => setActiveTab("my")}
          className={`px-5 py-2 rounded-full font-semibold transition ${
            activeTab === "my"
              ? "bg-orange-500 text-white"
              : "bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          {t("bookings.myRequests")} ({myBookings.length})
        </button>

        {user?.role !== "tenant" && (
          <button
            onClick={() => setActiveTab("received")}
            className={`px-5 py-2 rounded-full font-semibold transition ${
              activeTab === "received"
                ? "bg-orange-500 text-white"
                : "bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {t("bookings.receivedRequests")} ({receivedBookings.length})
          </button>
        )}
      </div>

      {/* ============ My Requests ============ */}
      {activeTab === "my" && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="rounded-lg bg-white shadow p-8 text-center dark:bg-zinc-900">
              <p className="text-stone-600 dark:text-zinc-400">
                {t("bookings.none")}{" "}
                <Link
                  to="/properties"
                  className="text-orange-600 hover:underline dark:text-orange-400"
                >
                  {t("bookings.browse")}
                </Link>
              </p>
            </div>
          ) : (
            myBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 dark:bg-zinc-900 dark:shadow-black/30"
              >
                <div>
                  <Link
                    to={`/property/${booking.property?._id}`}
                    className="text-xl font-bold hover:text-orange-600 dark:hover:text-orange-400"
                  >
                    {booking.property?.title || t("bookings.propertyRemoved")}
                  </Link>

                  <p className="text-stone-600 mt-1 dark:text-zinc-400">
                    📅 {formatDate(booking.date)}
                    {booking.time ? ` at ${booking.time}` : ""}
                  </p>

                  {booking.message && (
                    <p className="text-stone-500 mt-1 text-sm dark:text-zinc-500">
                      "{booking.message}"
                    </p>
                  )}

                  {booking.property?.owner && (
                    <p className="text-stone-500 mt-1 text-sm dark:text-zinc-500">
                      {t("bookings.owner")}: {booking.property.owner.fullName}
                      {booking.property.owner.phone &&
                        ` · ${booking.property.owner.phone}`}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      statusStyles[booking.status]
                    }`}
                  >
                    {t(`status.${booking.status}`)}
                  </span>

                  {["pending", "approved"].includes(booking.status) && (
                    <button
                      onClick={() => updateStatus(booking._id, "cancelled")}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      {t("bookings.cancel")}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============ Received Requests (landlord) ============ */}
      {activeTab === "received" && (
        <div className="space-y-4">
          {receivedBookings.length === 0 ? (
            <div className="rounded-lg bg-white shadow p-8 text-center dark:bg-zinc-900">
              <p className="text-stone-600 dark:text-zinc-400">
                {t("bookings.noneReceived")}
              </p>
            </div>
          ) : (
            receivedBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 dark:bg-zinc-900 dark:shadow-black/30"
              >
                <div>
                  <Link
                    to={`/property/${booking.property?._id}`}
                    className="text-xl font-bold hover:text-orange-600 dark:hover:text-orange-400"
                  >
                    {booking.property?.title || t("bookings.propertyRemoved")}
                  </Link>

                  <p className="text-stone-600 mt-1 dark:text-zinc-400">
                    📅 {formatDate(booking.date)}
                    {booking.time ? ` at ${booking.time}` : ""}
                  </p>

                  <p className="text-stone-500 mt-1 text-sm dark:text-zinc-500">
                    {t("bookings.requestedBy")}: {booking.tenant?.fullName}
                    {booking.tenant?.phone && ` · ${booking.tenant.phone}`}
                    {booking.tenant?.email && ` · ${booking.tenant.email}`}
                  </p>

                  {booking.message && (
                    <p className="text-stone-500 mt-1 text-sm dark:text-zinc-500">
                      "{booking.message}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      statusStyles[booking.status]
                    }`}
                  >
                    {t(`status.${booking.status}`)}
                  </span>

                  {booking.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(booking._id, "approved")}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        {t("bookings.approve")}
                      </button>

                      <button
                        onClick={() => updateStatus(booking._id, "rejected")}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
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

    </div>
  );
}
