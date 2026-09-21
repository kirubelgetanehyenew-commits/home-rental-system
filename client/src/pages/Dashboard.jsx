import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";
import PropertyCard from "../components/PropertyCard";

function StatCard({ label, value, link, icon }) {
  const inner = (
    <>
      {icon && <span className="stat-card__icon">{icon}</span>}
      <span className="stat-card__text">
        <p className="stat-card__value">{value}</p>
        <p className="stat-card__label">{label}</p>
      </span>
    </>
  );

  return link ? (
    <Link to={link} className="stat-card">
      {inner}
    </Link>
  ) : (
    <div className="stat-card">{inner}</div>
  );
}

const statusStyles = {
  pending: "badge badge--pending",
  approved: "badge badge--approved",
  rejected: "badge badge--rejected",
  cancelled: "badge badge--cancelled",
};

const paymentStyles = {
  pending: "badge badge--pending",
  approved: "badge badge--approved",
  successful: "badge badge--approved",
  rejected: "badge badge--rejected",
  failed: "badge badge--rejected",
  refunded: "badge badge--cancelled",
};

const statusBadge = {
  active: "badge--approved",
  pending: "badge--pending",
  inactive: "badge--cancelled",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLang();

  const [stats, setStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [myProperties, setMyProperties] = useState(null);
  const [tenantBookings, setTenantBookings] = useState(null);
  const [recommended, setRecommended] = useState(null);
  const [receivedBookings, setReceivedBookings] = useState(null);
  const [receivedPayments, setReceivedPayments] = useState(null);
  const [copiedId, setCopiedId] = useState("");

  const isLandlord = user?.role === "landlord";
  const isAdmin = user?.role === "admin";
  const isTenant = !isLandlord && !isAdmin;

  useEffect(() => {
    const loadStats = async () => {
      if (isLandlord) return;
      try {
        const res = await API.get("/stats/me");
        setStats(res.data.stats);
      } catch (err) {
        console.error(err);
      }
    };

    const loadAdminStats = async () => {
      if (!isAdmin) return;
      try {
        const res = await API.get("/stats/admin");
        setAdminStats(res.data.stats);
      } catch (err) {
        console.error(err);
      }
    };

    const loadMyProperties = async () => {
      if (!isLandlord) return;
      try {
        const res = await API.get("/properties/my-properties");
        setMyProperties(res.data.properties || []);
      } catch (err) {
        console.error(err);
        setMyProperties([]);
      }
    };

    const loadTenant = async () => {
      if (!isTenant || !user) return;
      try {
        const [bookingsRes, propsRes] = await Promise.all([
          API.get("/bookings/my-bookings"),
          API.get("/properties", { params: { limit: 3 } }),
        ]);
        setTenantBookings(bookingsRes.data.bookings || []);
        setRecommended(propsRes.data.properties || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadStats();
    loadAdminStats();
    loadMyProperties();
    loadTenant();
  }, [user, isAdmin, isLandlord, isTenant]);

  // Landlord panels: received requests, received payments + stats
  const loadLandlord = useCallback(async () => {
    try {
      const [bookingsRes, paymentsRes, statsRes] = await Promise.all([
        API.get("/bookings/received"),
        API.get("/payments/received"),
        API.get("/stats/me"),
      ]);
      setReceivedBookings(bookingsRes.data.bookings || []);
      setReceivedPayments(paymentsRes.data.payments || []);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error(err);
      setReceivedBookings([]);
      setReceivedPayments([]);
    }
  }, []);

  useEffect(() => {
    if (isLandlord) loadLandlord();
  }, [isLandlord, loadLandlord]);

  const refreshMyProperties = useCallback(async () => {
    try {
      const res = await API.get("/properties/my-properties");
      setMyProperties(res.data.properties || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  async function toggleAvailable(p) {
    try {
      await API.put(`/properties/${p._id}`, { available: !p.available });
      refreshMyProperties();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteProperty(p) {
    if (!window.confirm(t("prop.deleteConfirm"))) return;
    try {
      await API.delete(`/properties/${p._id}`);
      refreshMyProperties();
      loadLandlord();
    } catch (err) {
      console.error(err);
    }
  }

  async function copyLink(p) {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/property/${p._id}`
      );
      setCopiedId(p._id);
      setTimeout(() => setCopiedId(""), 1600);
    } catch (err) {
      console.error(err);
    }
  }

  async function duplicateProperty(p) {
    try {
      await API.post("/properties", {
        title: `${p.title} (Copy)`,
        description: p.description,
        price: p.price,
        location: p.location,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        area: p.area,
        propertyType: p.propertyType,
        images: p.images || [],
        amenities: p.amenities || [],
      });
      refreshMyProperties();
    } catch (err) {
      console.error(err);
    }
  }

  function bookingCount(p) {
    return (receivedBookings || []).filter(
      (b) => (b.property?._id || b.property) === p._id
    ).length;
  }

  function earnedAmount(p) {
    return (receivedPayments || [])
      .filter(
        (pay) =>
          (pay.property?._id || pay.property) === p._id &&
          ["approved", "successful"].includes(pay.status)
      )
      .reduce((sum, pay) => sum + (pay.amount || 0), 0);
  }

  async function setBookingStatus(id, status) {
    try {
      await API.put(`/bookings/${id}/status`, { status });
      loadLandlord();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="page page--dashboard">
      <div className="container container--wide">
        <h1 className="page-title page-title--lg">{t("dash.title")}</h1>

        {user ? (
          <>
            {/* ---------- Header ---------- */}
            <div className="card dash-hero">
              <div>
                <h2 className="section__title">
                  {t("dash.welcome")}, {user.fullName}
                </h2>
                <p className="soft">{user.email}</p>
              </div>
              <span
                className="badge badge--brand"
                style={{ textTransform: "capitalize" }}
              >
                {user.role}
              </span>
            </div>

            {/* ================= LANDLORD ================= */}
            {isLandlord && (
              <>
                {stats?.pendingRequests > 0 && (
                  <div className="dash-alert">
                    <span>
                      ⏳ {stats.pendingRequests} {t("dash.pendingApproval")}
                    </span>
                    <Link to="/bookings" className="btn btn--primary btn--sm">
                      {t("dash.viewRequests")}
                    </Link>
                  </div>
                )}

                {stats ? (
                  <div className="grid grid--4" style={{ marginBottom: 32 }}>
                    <StatCard
                      label={t("dash.myProperties")}
                      value={stats.myProperties}
                      link="/my-properties"
                      icon="🏠"
                    />
                    <StatCard
                      label={t("dash.pendingRequests")}
                      value={stats.pendingRequests}
                      link="/bookings"
                      icon="⏳"
                    />
                    <StatCard
                      label={t("dash.viewingRequests")}
                      value={stats.myBookings}
                      link="/bookings"
                      icon="📅"
                    />
                    <StatCard
                      label={t("dash.favorites")}
                      value={stats.favorites}
                      link="/favorites"
                      icon="❤️"
                    />
                  </div>
                ) : (
                  <p className="soft" style={{ marginBottom: 32 }}>
                    {t("dash.loadingStats")}
                  </p>
                )}

                <h3 className="section__title">{t("dash.quickActions")}</h3>
                <div className="grid grid--4" style={{ marginBottom: 32 }}>
                  <Link to="/add-property" className="admin-link">
                    ➕ {t("nav.addProperty")}
                  </Link>
                  <Link to="/my-properties" className="admin-link">
                    🏘️ {t("nav.myProperties")}
                  </Link>
                  <Link to="/bookings" className="admin-link">
                    📅 {t("nav.bookings")}
                  </Link>
                  <Link to="/messages" className="admin-link">
                    💬 {t("nav.messages")}
                  </Link>
                </div>

                <div className="dash-grid">
                  {/* Viewing requests panel */}
                  <section className="dash-panel">
                    <header className="dash-panel__head">
                      <h3>📅 {t("dash.receivedRequests")}</h3>
                      <Link to="/bookings" className="link">
                        {t("dash.viewAll")} →
                      </Link>
                    </header>
                    {receivedBookings === null ? (
                      <p className="soft" style={{ padding: 18 }}>
                        {t("dash.loadingStats")}
                      </p>
                    ) : receivedBookings.length === 0 ? (
                      <p className="empty" style={{ margin: 18 }}>
                        {t("dash.noRequests")}
                      </p>
                    ) : (
                      receivedBookings.slice(0, 5).map((b) => (
                        <div className="list-row" key={b._id}>
                          <div>
                            <p className="list-row__title">
                              {b.property?.title || "—"}
                            </p>
                            <p className="list-row__meta">
                              👤 {b.tenant?.fullName || "—"} · 📅{" "}
                              {new Date(b.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="list-row__actions">
                            {b.status === "pending" && (
                              <>
                                <button
                                  className="btn btn--success btn--sm"
                                  onClick={() =>
                                    setBookingStatus(b._id, "approved")
                                  }
                                >
                                  {t("admin.approve")}
                                </button>
                                <button
                                  className="btn btn--outline btn--sm"
                                  onClick={() =>
                                    setBookingStatus(b._id, "rejected")
                                  }
                                >
                                  {t("admin.reject")}
                                </button>
                              </>
                            )}
                            <span
                              className={statusStyles[b.status] || "badge"}
                              style={{ textTransform: "capitalize" }}
                            >
                              {b.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </section>

                  {/* Payments received panel */}
                  <section className="dash-panel">
                    <header className="dash-panel__head">
                      <h3>💳 {t("dash.paymentsReceived")}</h3>
                      <Link to="/payments" className="link">
                        {t("dash.viewAll")} →
                      </Link>
                    </header>
                    {receivedPayments === null ? (
                      <p className="soft" style={{ padding: 18 }}>
                        {t("dash.loadingStats")}
                      </p>
                    ) : receivedPayments.length === 0 ? (
                      <p className="empty" style={{ margin: 18 }}>
                        {t("dash.noPaymentsYet")}
                      </p>
                    ) : (
                      receivedPayments.slice(0, 5).map((p) => (
                        <div className="list-row" key={p._id}>
                          <div>
                            <p className="list-row__title">
                              {p.tenant?.fullName || "—"}
                            </p>
                            <p className="list-row__meta">
                              🏠 {p.property?.title || "—"} · 💵 {p.amount} ETB
                            </p>
                          </div>
                          <span
                            className={paymentStyles[p.status] || "badge"}
                            style={{ textTransform: "capitalize" }}
                          >
                            {p.status}
                          </span>
                        </div>
                      ))
                    )}
                  </section>
                </div>

                <div
                  className="row row--wrap"
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <h3 className="section__title" style={{ margin: 0 }}>
                    {t("dash.yourProperties")}
                  </h3>
                  <Link to="/my-properties" className="link">
                    {t("dash.manageAll")} →
                  </Link>
                </div>

                {myProperties === null ? (
                  <p className="soft">{t("dash.loadingStats")}</p>
                ) : myProperties.length === 0 ? (
                  <div className="card">
                    <p className="empty">{t("dash.noProperties")}</p>
                    <Link
                      to="/add-property"
                      className="btn btn--primary"
                      style={{ marginTop: 12 }}
                    >
                      {t("nav.addProperty")}
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid--2" style={{ marginBottom: 8 }}>
                    {myProperties.slice(0, 4).map((p) => (
                      <article className="prop-rich" key={p._id}>
                        <div className={`prop-rich__media${p.available ? "" : " prop-rich__media--dim"}`}>
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.title} />
                          ) : (
                            <span className="prop-rich__noimg">🏠</span>
                          )}
                          <span
                            className={`badge ${statusBadge[p.status] || "badge--pending"} prop-rich__status`}
                          >
                            {t(`status.${p.status}`)}
                          </span>
                          {!p.available && (
                            <span className="prop-rich__unavailable">
                              {t("prop.unavailable")}
                            </span>
                          )}
                          <span className="prop-rich__type">
                            {t(`type.${p.propertyType}`)}
                          </span>
                        </div>

                        <div className="prop-rich__body">
                          <div className="prop-rich__head">
                            <h4 className="prop-rich__title">{p.title}</h4>
                            <p className="prop-rich__price">
                              {Number(p.price).toLocaleString()}{" "}
                              <span>ETB {t("details.perMonth")}</span>
                            </p>
                          </div>

                          <p className="prop-rich__loc">
                            📍 {p.location || p.city || p.address || "—"}
                          </p>

                          <div className="prop-rich__specs">
                            <span>🛏 {p.bedrooms}</span>
                            <span>🛁 {p.bathrooms}</span>
                            <span>📐 {p.area} m²</span>
                            {p.furnished && <span>🛋 {t("prop.furnished")}</span>}
                            <span>
                              📅 {bookingCount(p)} {t("prop.bookings")}
                            </span>
                            <span>
                              💵 {earnedAmount(p).toLocaleString()} ETB{" "}
                              {t("prop.earned")}
                            </span>
                          </div>

                          {p.amenities?.length > 0 && (
                            <div className="prop-rich__amenities">
                              {p.amenities.slice(0, 3).map((a) => (
                                <span className="prop-rich__amenity" key={a}>
                                  {t(`amenity.${a}`)}
                                </span>
                              ))}
                              {p.amenities.length > 3 && (
                                <span className="prop-rich__amenity">
                                  +{p.amenities.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="prop-rich__actions">
                            <Link
                              to={`/property/${p._id}`}
                              className="btn btn--outline btn--sm"
                            >
                              👁 {t("nav.properties")}
                            </Link>
                            <Link
                              to={`/edit-property/${p._id}`}
                              className="btn btn--primary btn--sm"
                            >
                              ✏️ {t("edit.title")}
                            </Link>
                            <button
                              type="button"
                              className="btn btn--outline btn--sm"
                              onClick={() => copyLink(p)}
                              title={t("prop.copyLink")}
                            >
                              {copiedId === p._id ? "✅" : "🔗"} {t("prop.share")}
                            </button>
                            <button
                              type="button"
                              className="btn btn--outline btn--sm"
                              onClick={() => duplicateProperty(p)}
                              title={t("prop.duplicate")}
                            >
                              📋 {t("prop.duplicate")}
                            </button>
                            <button
                              type="button"
                              className={`btn btn--sm ${
                                p.available ? "btn--outline" : "btn--success"
                              }`}
                              onClick={() => toggleAvailable(p)}
                              title={
                                p.available
                                  ? t("prop.markUnavailable")
                                  : t("prop.markAvailable")
                              }
                            >
                              {p.available ? "🚫" : "✅"}{" "}
                              {p.available
                                ? t("prop.markUnavailable")
                                : t("prop.markAvailable")}
                            </button>
                            <button
                              type="button"
                              className="btn btn--danger btn--sm"
                              onClick={() => deleteProperty(p)}
                              title={t("prop.delete")}
                            >
                              🗑 {t("prop.delete")}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ================= ADMIN ================= */}
            {isAdmin && (
              <div>
                <h3 className="section__title">{t("dash.adminOverview")}</h3>

                <div className="grid grid--3" style={{ marginBottom: 24 }}>
                  <Link to="/admin?tab=users" className="admin-link">
                    👥 {t("admin.users")}
                  </Link>
                  <Link to="/admin?tab=properties" className="admin-link">
                    🏠 {t("admin.properties")}
                  </Link>
                  <Link to="/admin?tab=reports" className="admin-link">
                    🚩 {t("admin.reports")}
                  </Link>
                </div>

                {adminStats ? (
                  <>
                    <div className="grid grid--4" style={{ marginBottom: 24 }}>
                      <StatCard label={t("dash.totalUsers")} value={adminStats.totalUsers} icon="👥" />
                      <StatCard label={t("dash.landlords")} value={adminStats.totalLandlords} icon="🏘️" />
                      <StatCard
                        label={t("dash.activeProperties")}
                        value={`${adminStats.activeProperties} / ${adminStats.totalProperties}`}
                        icon="🏠"
                      />
                      <StatCard label={t("dash.totalReviews")} value={adminStats.totalReviews} icon="⭐" />
                    </div>

                    <div className="card">
                      <h4 style={{ marginBottom: 12 }}>
                        {t("dash.pendingViewings")}: {adminStats.pendingBookings}
                      </h4>

                      <h4 style={{ marginBottom: 12 }}>{t("dash.recentUsers")}</h4>

                      <div className="table-wrap">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>{t("dash.name")}</th>
                              <th>{t("form.email")}</th>
                              <th>{t("dash.role")}</th>
                              <th>{t("dash.joined")}</th>
                            </tr>
                          </thead>

                          <tbody>
                            {adminStats.recentUsers.map((u) => (
                              <tr key={u._id}>
                                <td>{u.fullName}</td>
                                <td>{u.email}</td>
                                <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="soft">{t("dash.loadingStats")}</p>
                )}
              </div>
            )}

            {/* ================= TENANT ================= */}
            {!isLandlord && !isAdmin && (
              <>
                {stats ? (
                  <div className="grid grid--3" style={{ marginBottom: 32 }}>
                    <StatCard
                      label={t("dash.favorites")}
                      value={stats.favorites}
                      link="/favorites"
                      icon="❤️"
                    />
                    <StatCard
                      label={t("dash.viewingRequests")}
                      value={stats.myBookings}
                      link="/bookings"
                      icon="📅"
                    />
                    <StatCard
                      label={t("dash.reviewsWritten")}
                      value={stats.myReviews}
                      icon="⭐"
                    />
                  </div>
                ) : (
                  <p className="soft" style={{ marginBottom: 32 }}>
                    {t("dash.loadingStats")}
                  </p>
                )}

                <h3 className="section__title">{t("dash.quickActions")}</h3>
                <div className="grid grid--3">
                  <Link to="/" className="admin-link">
                    🔎 {t("nav.properties")}
                  </Link>
                  <Link to="/favorites" className="admin-link">
                    ❤️ {t("nav.favorites")}
                  </Link>
                  <Link to="/messages" className="admin-link">
                    💬 {t("nav.messages")}
                  </Link>
                </div>

                {/* Recent viewing requests */}
                <div
                  className="row row--wrap"
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                    marginTop: 8,
                  }}
                >
                  <h3 className="section__title" style={{ margin: 0 }}>
                    {t("dash.recentRequests")}
                  </h3>
                  <Link to="/bookings" className="link">
                    {t("dash.viewAll")} →
                  </Link>
                </div>

                {tenantBookings === null ? (
                  <p className="soft">{t("dash.loadingStats")}</p>
                ) : tenantBookings.length === 0 ? (
                  <div className="card" style={{ marginBottom: 32 }}>
                    <p className="empty">{t("dash.noRequests")}</p>
                    <Link
                      to="/"
                      className="btn btn--primary"
                      style={{ marginTop: 12 }}
                    >
                      {t("nav.properties")}
                    </Link>
                  </div>
                ) : (
                  <div
                    className="card"
                    style={{ padding: 0, overflow: "hidden", marginBottom: 32 }}
                  >
                    {tenantBookings.slice(0, 4).map((b) => (
                      <div className="list-row" key={b._id}>
                        <div>
                          <Link
                            to={`/property/${b.property?._id}`}
                            className="list-row__title"
                          >
                            {b.property?.title || "—"}
                          </Link>
                          <p className="list-row__meta">
                            📅 {new Date(b.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={statusStyles[b.status] || "badge"}
                          style={{ textTransform: "capitalize" }}
                        >
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommended properties */}
                <div
                  className="row row--wrap"
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <h3 className="section__title" style={{ margin: 0 }}>
                    {t("dash.recommended")}
                  </h3>
                  <Link to="/" className="link">
                    {t("home.browse")} →
                  </Link>
                </div>

                {recommended && recommended.length > 0 ? (
                  <div className="grid grid--cards">
                    {recommended.map((p) => (
                      <PropertyCard key={p._id} property={p} />
                    ))}
                  </div>
                ) : (
                  <p className="soft">{t("dash.loadingStats")}</p>
                )}
              </>
            )}
          </>
        ) : (
          <p>{t("dash.notLoggedIn")}</p>
        )}
      </div>
    </div>
  );
}
