import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";
import PropertyCard from "../components/PropertyCard";

function StatCard({ label, value, link }) {
  const inner = (
    <>
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__label">{label}</p>
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

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLang();

  const [stats, setStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [myProperties, setMyProperties] = useState(null);
  const [tenantBookings, setTenantBookings] = useState(null);
  const [recommended, setRecommended] = useState(null);

  const isLandlord = user?.role === "landlord";
  const isAdmin = user?.role === "admin";
  const isTenant = !isLandlord && !isAdmin;

  useEffect(() => {
    const loadStats = async () => {
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
                    />
                    <StatCard
                      label={t("dash.pendingRequests")}
                      value={stats.pendingRequests}
                      link="/bookings"
                    />
                    <StatCard
                      label={t("dash.viewingRequests")}
                      value={stats.myBookings}
                      link="/bookings"
                    />
                    <StatCard
                      label={t("dash.favorites")}
                      value={stats.favorites}
                      link="/favorites"
                    />
                  </div>
                ) : (
                  <p className="soft" style={{ marginBottom: 32 }}>
                    {t("dash.loadingStats")}
                  </p>
                )}

                <h3 className="section__title">{t("dash.quickActions")}</h3>
                <div className="grid grid--3" style={{ marginBottom: 32 }}>
                  <Link to="/add-property" className="admin-link">
                    ➕ {t("nav.addProperty")}
                  </Link>
                  <Link to="/my-properties" className="admin-link">
                    🏘️ {t("nav.myProperties")}
                  </Link>
                  <Link to="/bookings" className="admin-link">
                    📅 {t("nav.bookings")}
                  </Link>
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
                  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    {myProperties.slice(0, 4).map((p) => (
                      <div className="list-row" key={p._id}>
                        <div>
                          <p className="list-row__title">{p.title}</p>
                          <p className="list-row__meta">
                            📍 {p.location} · ${p.price}/mo
                          </p>
                        </div>
                        <div className="list-row__actions">
                          <Link
                            to={`/property/${p._id}`}
                            className="btn btn--outline btn--sm"
                            title={t("nav.properties")}
                          >
                            👁
                          </Link>
                          <Link
                            to={`/edit-property/${p._id}`}
                            className="btn btn--primary btn--sm"
                            title={t("edit.title")}
                          >
                            ✏️
                          </Link>
                        </div>
                      </div>
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
                      <StatCard label={t("dash.totalUsers")} value={adminStats.totalUsers} />
                      <StatCard label={t("dash.landlords")} value={adminStats.totalLandlords} />
                      <StatCard
                        label={t("dash.activeProperties")}
                        value={`${adminStats.activeProperties} / ${adminStats.totalProperties}`}
                      />
                      <StatCard label={t("dash.totalReviews")} value={adminStats.totalReviews} />
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
                    />
                    <StatCard
                      label={t("dash.viewingRequests")}
                      value={stats.myBookings}
                      link="/bookings"
                    />
                    <StatCard
                      label={t("dash.reviewsWritten")}
                      value={stats.myReviews}
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
