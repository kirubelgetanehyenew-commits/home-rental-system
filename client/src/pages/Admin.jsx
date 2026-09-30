import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../services/api";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { id: "overview", icon: "📊", label: "admin.tabOverview" },
  { id: "users", icon: "👥", label: "admin.users" },
  { id: "properties", icon: "🏠", label: "admin.properties" },
  { id: "premium", icon: "✨", label: "admin.premiumTab" },
  { id: "bookings", icon: "📅", label: "admin.tabBookings" },
  { id: "payments", icon: "💳", label: "payments.pageTitle" },
  { id: "reviews", icon: "⭐", label: "admin.statReviews" },
  { id: "reports", icon: "🚩", label: "admin.reports" },
];

const BOOKING_BADGE = {
  pending: "badge badge--pending",
  approved: "badge badge--success",
  rejected: "badge badge--danger",
  cancelled: "badge badge--muted",
};

const PAYMENT_BADGE = {
  pending: "badge badge--pending",
  approved: "badge badge--success",
  successful: "badge badge--success",
  rejected: "badge badge--danger",
  failed: "badge badge--danger",
  refunded: "badge badge--muted",
};

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

/* =========================  OVERVIEW  ========================= */
function OverviewTab({ goTo }) {
  const { t } = useLang();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(false);
    try {
      const res = await API.get("/admin/overview");
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
      setError(true);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error && !stats)
    return (
      <div className="empty">
        <p style={{ marginBottom: 12 }}>⚠️ {t("admin.loadError")}</p>
        <button className="btn btn--primary btn--sm" onClick={load}>
          🔄 {t("admin.retry")}
        </button>
      </div>
    );

  if (!stats) return <div className="loading">{t("common.loading")}</div>;

  const kpis = [
    { label: t("admin.statUsers"), value: stats.totalUsers, tab: "users", icon: "👥", tone: "blue" },
    { label: t("admin.statProperties"), value: stats.totalProperties, tab: "properties", icon: "🏠", tone: "cyan" },
    { label: t("admin.statBookings"), value: stats.totalBookings, tab: "bookings", icon: "📅", tone: "indigo" },
    { label: t("admin.statReviews"), value: stats.totalReviews, tab: "reviews", icon: "⭐", tone: "teal" },
  ];

  const attention = [
    { label: t("admin.pendingProperties"), value: stats.pendingProperties, tab: "properties", icon: "⏳" },
    { label: t("admin.pendingBookings"), value: stats.pendingBookings, tab: "bookings", icon: "⌛" },
    { label: t("admin.pendingReports"), value: stats.pendingReports, tab: "reports", icon: "🕵️" },
  ];
  const attentionTotal = attention.reduce((s, a) => s + (a.value ?? 0), 0);

  const breakdown = [
    { label: t("register.tenant"), value: stats.totalTenants, tab: "users", icon: "🧑" },
    { label: t("register.landlord"), value: stats.totalLandlords, tab: "users", icon: "🏘️" },
    { label: t("admin.approved"), value: stats.approvedProperties, tab: "properties", icon: "✅" },
    { label: t("admin.statReports"), value: stats.totalReports, tab: "reports", icon: "🚩" },
  ];

  const quickActions = [
    { label: t("admin.quick.users"), desc: t("admin.quick.users.desc"), icon: "👥", tab: "users" },
    { label: t("admin.quick.properties"), desc: t("admin.quick.properties.desc"), icon: "🏠", tab: "properties" },
    { label: t("admin.quick.bookings"), desc: t("admin.quick.bookings.desc"), icon: "📅", tab: "bookings" },
    { label: t("admin.quick.reports"), desc: t("admin.quick.reports.desc"), icon: "🚩", tab: "reports" },
  ];

  const activity = [
    { label: t("admin.activity.pendingProperties"), value: stats.pendingProperties, tab: "properties", icon: "⏳" },
    { label: t("admin.activity.pendingBookings"), value: stats.pendingBookings, tab: "bookings", icon: "📝" },
    { label: t("admin.activity.pendingReports"), value: stats.pendingReports, tab: "reports", icon: "🛎️" },
    { label: t("admin.activity.totalReviews"), value: stats.totalReviews, tab: "reviews", icon: "⭐" },
  ];

  const row = (item, pillClass) => {
    const content = (
      <>
        <span className="ao-row__icon">{item.icon}</span>
        <span className="ao-row__label">{item.label}</span>
        <span className={`ao-row__pill ${pillClass(item)}`}>{item.value ?? 0}</span>
        <span className="ao-row__go" aria-hidden="true">→</span>
      </>
    );
    return item.tab ? (
      <button key={item.label} className="ao-row" onClick={() => goTo(item.tab)}>
        {content}
      </button>
    ) : (
      <div key={item.label} className="ao-row">{content}</div>
    );
  };

  return (
    <div className="ao">
      <div className="ao-kpis">
        {kpis.map((k) => {
          const inner = (
            <>
              <span className="ao-kpi__icon">{k.icon}</span>
              <span className="ao-kpi__value">{k.value ?? 0}</span>
              <span className="ao-kpi__label">{k.label}</span>
              {k.tab && <span className="ao-kpi__go" aria-hidden="true">→</span>}
            </>
          );
          return k.tab ? (
            <button
              key={k.label}
              className={`ao-kpi ao-kpi--${k.tone} ao-kpi--link`}
              onClick={() => goTo(k.tab)}
            >
              {inner}
            </button>
          ) : (
            <div key={k.label} className={`ao-kpi ao-kpi--${k.tone}`}>
              {inner}
            </div>
          );
        })}
      </div>

      <section className="ao-panel ao-panel--wide">
        <header className="ao-panel__head">
          <span className="ao-panel__title">⚡ {t("admin.quickActions")}</span>
        </header>
        <div className="ao-quick-actions">
          {quickActions.map((item) => (
            <button key={item.label} className="ao-quick-action" onClick={() => goTo(item.tab)}>
              <span className="ao-quick-action__icon">{item.icon}</span>
              <span className="ao-quick-action__content">
                <span className="ao-quick-action__title">{item.label}</span>
                <span className="ao-quick-action__desc">{item.desc}</span>
              </span>
              <span className="ao-quick-action__arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </section>

      <div className="ao-columns">
        <section className="ao-panel">
          <header className="ao-panel__head">
            <span className="ao-panel__title">🚀 {t("admin.activity")}</span>
            <span className="ao-panel__count">{activity.reduce((sum, item) => sum + (item.value ?? 0), 0)}</span>
          </header>
          <div className="ao-panel__body">
            {activity.map((item) => (
              <button key={item.label} className="ao-row" onClick={() => goTo(item.tab)}>
                <span className="ao-row__icon">{item.icon}</span>
                <span className="ao-row__label">{item.label}</span>
                <span className="ao-row__pill ao-row__pill--warn">{item.value ?? 0}</span>
                <span className="ao-row__go" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>

        <section className="ao-panel">
          <header className="ao-panel__head">
            <span className="ao-panel__title">⚡ {t("admin.needsAttention")}</span>
            <span className="ao-panel__tools">
              <span
                className={`ao-panel__count ${attentionTotal === 0 ? "ao-panel__count--clear" : ""}`}
              >
                {attentionTotal === 0 ? "✅" : attentionTotal}
              </span>
              <button
                className="ao-refresh"
                onClick={load}
                disabled={refreshing}
                title={t("admin.refresh")}
              >
                <span className={`ao-refresh__icon ${refreshing ? "ao-refresh__icon--spin" : ""}`}>
                  🔄
                </span>
                {t("admin.refresh")}
              </button>
            </span>
          </header>
          <div className="ao-panel__body">
            {attention.map((item) =>
              row(item, (i) => (i.value > 0 ? "ao-row__pill--warn" : "ao-row__pill--ok"))
            )}
          </div>
        </section>

        <section className="ao-panel ao-panel--full">
          <header className="ao-panel__head">
            <span className="ao-panel__title">📂 {t("admin.breakdown")}</span>
          </header>
          <div className="ao-panel__body">
            {breakdown.map((item) => row(item, () => ""))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================  USERS  ========================= */
function UsersTab() {
  const { t } = useLang();
  const { user } = useAuth();
  const userId = user?.id;
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (role) params.role = role;
      const res = await API.get("/admin/users", { params });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [search, role]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleSuspend(user) {
    try {
      await API.put(`/admin/users/${user._id}/status`, {
        isSuspended: !user.isSuspended,
      });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function remove(user) {
    if (!confirm(`${t("admin.deleteConfirm")} ${user.fullName}?`)) return;
    try {
      await API.delete(`/admin/users/${user._id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function setRole_(id, role) {
    try {
      await API.put(`/admin/users/${id}/role`, { role });
      load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "You are not allowed to change user roles.");
    }
  }

  return (
    <>
      <div className="toolbar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder={t("admin.searchUsers")}
          className="input"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="select"
        >
          <option value="">{t("admin.allRoles")}</option>
          <option value="tenant">{t("register.tenant")}</option>
          <option value="landlord">{t("register.landlord")}</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={load} className="btn btn--primary">
          {t("admin.filter")}
        </button>
      </div>

      {loading ? (
        <div className="loading">{t("common.loading")}</div>
      ) : users.length === 0 ? (
        <div className="empty">{t("admin.noUsers")}</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t("dash.name")}</th>
                <th>{t("form.email")}</th>
                <th>{t("dash.role")}</th>
                <th>{t("admin.status")}</th>
                <th>{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>
                    <span style={{ textTransform: "capitalize" }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.isSuspended ? (
                      <span className="badge badge--suspended">
                        {t("admin.suspended")}
                      </span>
                    ) : (
                      <span className="badge badge--active">
                        {t("admin.active")}
                      </span>
                    )}
                  </td>
                  <td>
                    {u.role !== "admin" ? (
                      <div className="row row--wrap">
                        <button
                          onClick={() => toggleSuspend(u)}
                          className="btn btn--outline btn--sm"
                        >
                          {u.isSuspended ? t("admin.activate") : t("admin.suspend")}
                        </button>
                        <button
                          onClick={() => remove(u)}
                          className="btn btn--danger-outline btn--sm"
                        >
                          {t("admin.delete")}
                        </button>
                      </div>
                    ) : (
                      <span className="soft">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* =========================  PROPERTIES  ========================= */
function PropertiesTab() {
  const { t } = useLang();
  const [properties, setProperties] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = status ? { status } : {};
      const res = await API.get("/admin/properties", { params });
      setProperties(res.data.properties || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus_(id, newStatus) {
    try {
      await API.put(`/admin/properties/${id}/status`, { status: newStatus });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function remove(id) {
    if (!confirm(t("admin.deletePropertyConfirm"))) return;
    try {
      await API.delete(`/admin/properties/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <div className="toolbar">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="select"
        >
          <option value="">{t("admin.allStatuses")}</option>
          <option value="active">{t("admin.active")}</option>
          <option value="pending">{t("status.pending")}</option>
          <option value="inactive">{t("admin.inactive")}</option>
        </select>
        <button onClick={load} className="btn btn--primary">
          {t("admin.filter")}
        </button>
      </div>

      {loading ? (
        <div className="loading">{t("common.loading")}</div>
      ) : properties.length === 0 ? (
        <div className="empty">{t("admin.noProperties")}</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t("admin.title")}</th>
                <th>{t("admin.owner")}</th>
                <th>{t("admin.propertyType")}</th>
                <th>{t("admin.location")}</th>
                <th>{t("admin.rooms")}</th>
                <th>{t("admin.area")}</th>
                <th>{t("admin.price")}</th>
                <th>{t("admin.premium")}</th>
                <th>{t("admin.status")}</th>
                <th>{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>
                    <div className="admin-prop__title-wrap">
                      <Link to={`/property/${p._id}`} className="link">
                        {p.title}
                      </Link>
                      <small className="admin-prop__meta">{p.city || p.subCity || p.location || "—"}</small>
                    </div>
                  </td>
                  <td>{p.owner?.fullName || "—"}</td>
                  <td>{p.propertyType || "—"}</td>
                  <td>{p.location || p.address || p.city || "—"}</td>
                  <td>
                    {p.bedrooms ?? 0} bd / {p.bathrooms ?? 0} ba
                  </td>
                  <td>{p.area ? `${p.area} m²` : "—"}</td>
                  <td>{p.price?.toLocaleString()} ETB</td>
                  <td>
                    {p.isPremium ? (
                      <span className="badge badge--success">Premium</span>
                    ) : (
                      <span className="badge badge--muted">Standard</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge--${p.status}`}>{cap(p.status)}</span>
                  </td>
                  <td>
                    <div className="admin-prop__actions">
                      {p.status !== "active" && (
                        <button
                          onClick={() => setStatus_(p._id, "active")}
                          className="btn btn--success btn--sm"
                        >
                          {t("admin.approve")}
                        </button>
                      )}
                      {p.status !== "pending" && (
                        <button
                          onClick={() => setStatus_(p._id, "pending")}
                          className="btn btn--outline btn--sm"
                        >
                          {t("admin.markPending")}
                        </button>
                      )}
                      {p.status !== "inactive" && (
                        <button
                          onClick={() => setStatus_(p._id, "inactive")}
                          className="btn btn--outline btn--sm"
                        >
                          {t("admin.deactivate")}
                        </button>
                      )}
                      <button
                        onClick={() => remove(p._id)}
                        className="btn btn--danger-outline btn--sm"
                      >
                        {t("admin.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* =========================  PREMIUM  ========================= */
function PremiumTab() {
  const { t } = useLang();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/properties");
      const premiumProperties = (res.data.properties || []).filter(
        (property) => property.isPremium || property.premiumRequested
      );
      setProperties(premiumProperties);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function approvePremium(id) {
    try {
      await API.put(`/admin/properties/${id}/premium`);
      load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Unable to approve premium listing.");
    }
  }

  return (
    <>
      <div className="toolbar">
        <button onClick={load} className="btn btn--primary">
          {t("admin.refresh")}
        </button>
      </div>

      {loading ? (
        <div className="loading">{t("common.loading")}</div>
      ) : properties.length === 0 ? (
        <div className="empty">{t("admin.noPremiumProperties")}</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t("admin.title")}</th>
                <th>{t("admin.owner")}</th>
                <th>{t("admin.propertyType")}</th>
                <th>{t("admin.price")}</th>
                <th>{t("admin.premiumStatus")}</th>
                <th>{t("admin.status")}</th>
                <th>{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="admin-prop__title-wrap">
                      <Link to={`/property/${p._id}`} className="link">
                        {p.title}
                      </Link>
                      <small className="admin-prop__meta">{p.location || p.city || "—"}</small>
                    </div>
                  </td>
                  <td>{p.owner?.fullName || "—"}</td>
                  <td>{p.propertyType || "—"}</td>
                  <td>{p.price?.toLocaleString()} ETB</td>
                  <td>
                    <div className="row row--stacked">
                      {p.isPremium ? (
                        <span className="badge badge--success">{t("admin.premiumActive")}</span>
                      ) : p.premiumRequested ? (
                        <span className="badge badge--pending">{t("admin.premiumPending")}</span>
                      ) : (
                        <span className="badge badge--muted">{t("admin.standard")}</span>
                      )}
                      {p.premiumFeePaid && (
                        <small className="soft">5000 ETB paid</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge--${p.status}`}>{cap(p.status)}</span>
                  </td>
                  <td>
                    {!p.isPremium && (
                      <button
                        onClick={() => approvePremium(p._id)}
                        className="btn btn--primary btn--sm"
                      >
                        {t("admin.givePremium")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* =========================  BOOKINGS  ========================= */
function BookingsTab() {
  const { t } = useLang();
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = status ? { status } : {};
      const res = await API.get("/admin/bookings", { params });
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus_(id, newStatus) {
    try {
      await API.put(`/admin/bookings/${id}/status`, { status: newStatus });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function remove(id) {
    if (!confirm(t("admin.deleteBookingConfirm"))) return;
    try {
      await API.delete(`/admin/bookings/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <div className="toolbar">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="select"
        >
          <option value="">{t("admin.allStatuses")}</option>
          <option value="pending">{t("status.pending")}</option>
          <option value="approved">{t("admin.approved")}</option>
          <option value="rejected">{t("admin.rejected")}</option>
          <option value="cancelled">{t("admin.cancelled")}</option>
        </select>
        <button onClick={load} className="btn btn--primary">
          {t("admin.filter")}
        </button>
      </div>

      {loading ? (
        <div className="loading">{t("common.loading")}</div>
      ) : bookings.length === 0 ? (
        <div className="empty">{t("admin.noBookings")}</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t("admin.property")}</th>
                <th>{t("admin.tenantCol")}</th>
                <th>{t("admin.dateCol")}</th>
                <th>{t("admin.status")}</th>
                <th>{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td style={{ fontWeight: 600 }}>
                    {b.property ? (
                      <Link to={`/property/${b.property._id}`} className="link">
                        {b.property.title}
                      </Link>
                    ) : (
                      <span className="soft">—</span>
                    )}
                  </td>
                  <td>{b.tenant?.fullName || "—"}</td>
                  <td>
                    {b.date
                      ? new Date(b.date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <span className={BOOKING_BADGE[b.status] || "badge badge--muted"}>
                      {cap(b.status)}
                    </span>
                  </td>
                  <td>
                    <div className="row row--wrap">
                      {b.status !== "approved" && (
                        <button
                          onClick={() => setStatus_(b._id, "approved")}
                          className="btn btn--success btn--sm"
                        >
                          {t("admin.approve")}
                        </button>
                      )}
                      {b.status !== "rejected" && (
                        <button
                          onClick={() => setStatus_(b._id, "rejected")}
                          className="btn btn--outline btn--sm"
                        >
                          {t("admin.reject")}
                        </button>
                      )}
                      {b.status !== "cancelled" && (
                        <button
                          onClick={() => setStatus_(b._id, "cancelled")}
                          className="btn btn--outline btn--sm"
                        >
                          {t("admin.cancel")}
                        </button>
                      )}
                      <button
                        onClick={() => remove(b._id)}
                        className="btn btn--danger-outline btn--sm"
                      >
                        {t("admin.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* =========================  PAYMENTS  ========================= */
function PaymentsTab() {
  const { t } = useLang();
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = status ? { status } : {};
      const res = await API.get("/admin/payments", { params });
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus_(id, newStatus) {
    try {
      await API.put(`/admin/payments/${id}/status`, { status: newStatus });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function remove(id) {
    if (!confirm(t("admin.deletePaymentConfirm"))) return;
    try {
      await API.delete(`/admin/payments/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <div className="toolbar">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="select"
        >
          <option value="">{t("admin.allStatuses")}</option>
          <option value="pending">{t("status.pending")}</option>
          <option value="approved">{t("admin.approved")}</option>
          <option value="rejected">{t("admin.rejected")}</option>
          <option value="successful">{t("admin.successful")}</option>
          <option value="refunded">{t("admin.refunded")}</option>
        </select>
        <button onClick={load} className="btn btn--primary">
          {t("admin.filter")}
        </button>
      </div>

      {loading ? (
        <div className="loading">{t("common.loading")}</div>
      ) : payments.length === 0 ? (
        <div className="empty">{t("admin.noPayments")}</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t("admin.tenantCol")}</th>
                <th>{t("admin.owner")}</th>
                <th>{t("admin.property")}</th>
                <th>{t("admin.price")}</th>
                <th>Type</th>
                <th>{t("admin.method")}</th>
                <th>{t("admin.shot")}</th>
                <th>{t("admin.status")}</th>
                <th>{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>{p.tenant?.fullName || "—"}</td>
                  <td>{p.landlord?.fullName || "—"}</td>
                  <td>{p.property?.title || "—"}</td>
                  <td>{p.amount?.toLocaleString()} ETB</td>
                  <td>{p.type === "premium" ? "Premium fee" : "Booking payment"}</td>
                  <td>{p.method}</td>
                  <td>
                    {p.screenshot ? (
                      <a href={p.screenshot} target="_blank" rel="noreferrer">
                        <img
                          src={p.screenshot}
                          alt={t("admin.shot")}
                          className="pay-shot-inline"
                        />
                      </a>
                    ) : (
                      <span className="soft">—</span>
                    )}
                  </td>
                  <td>
                    <span className={PAYMENT_BADGE[p.status] || "badge badge--muted"}>
                      {cap(p.status)}
                    </span>
                  </td>
                  <td>
                    <div className="row row--wrap">
                      {p.status !== "approved" && (
                        <button
                          onClick={() => setStatus_(p._id, "approved")}
                          className="btn btn--success btn--sm"
                        >
                          {t("admin.approve")}
                        </button>
                      )}
                      {p.status !== "rejected" && (
                        <button
                          onClick={() => setStatus_(p._id, "rejected")}
                          className="btn btn--outline btn--sm"
                        >
                          {t("admin.reject")}
                        </button>
                      )}
                      <button
                        onClick={() => remove(p._id)}
                        className="btn btn--danger-outline btn--sm"
                      >
                        {t("admin.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* =========================  REVIEWS  ========================= */
function ReviewsTab() {
  const { t } = useLang();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/reviews");
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id) {
    if (!confirm(t("admin.deleteReviewConfirm"))) return;
    try {
      await API.delete(`/admin/reviews/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="loading">{t("common.loading")}</div>;
  if (reviews.length === 0)
    return <div className="empty">{t("admin.noReviews")}</div>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>{t("admin.user")}</th>
            <th>{t("admin.property")}</th>
            <th>{t("admin.rating")}</th>
            <th>{t("admin.comment")}</th>
            <th>{t("admin.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r._id}>
              <td style={{ fontWeight: 600 }}>{r.user?.fullName || "—"}</td>
              <td>{r.property?.title || "—"}</td>
              <td className="review-stars">{"★".repeat(r.rating)}</td>
              <td className="soft">{r.comment || "—"}</td>
              <td>
                <button
                  onClick={() => remove(r._id)}
                  className="btn btn--danger-outline btn--sm"
                >
                  {t("admin.delete")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================  REPORTS  ========================= */
function ReportsTab() {
  const { t } = useLang();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/reports");
      setReports(res.data.reports || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function resolve(id, status) {
    try {
      await API.put(`/admin/reports/${id}`, { status });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  const badge = {
    resolved: "badge badge--success",
    dismissed: "badge badge--muted",
    pending: "badge badge--pending",
  };

  if (loading) return <div className="loading">{t("common.loading")}</div>;
  if (reports.length === 0) return <div className="empty">{t("admin.noReports")}</div>;

  return (
    <div className="stack">
      {reports.map((r) => (
        <div key={r._id} className="card card--pad-lg">
          <div className="row row--between row--center row--wrap">
            <div>
              <p style={{ fontWeight: 700 }}>
                {t("admin.reportedBy")}: {r.reporter?.fullName}
              </p>
              <p className="list-row__meta">
                {r.property
                  ? `${t("admin.property")}: ${r.property.title}`
                  : `${t("admin.user")}: ${r.reportedUser?.fullName}`}
              </p>
              <p style={{ marginTop: 6 }}>
                <span style={{ fontWeight: 600 }}>{t("admin.reason")}:</span>{" "}
                {r.reason}
              </p>
              {r.description && <p className="soft">{r.description}</p>}
            </div>
            <span className={badge[r.status] || "badge badge--muted"}>
              {cap(r.status)}
            </span>
          </div>

          {r.status === "pending" && (
            <div className="row row--wrap" style={{ marginTop: 14 }}>
              <button
                onClick={() => resolve(r._id, "resolved")}
                className="btn btn--success btn--sm"
              >
                {t("admin.resolve")}
              </button>
              <button
                onClick={() => resolve(r._id, "dismissed")}
                className="btn btn--outline btn--sm"
              >
                {t("admin.dismiss")}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* =========================  SHELL  ========================= */
export default function Admin() {
  const { t } = useLang();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((x) => x.id === params.get("tab"))
    ? params.get("tab")
    : "overview";

  const goTo = (id) => setParams({ tab: id });
  const activeTab = TABS.find((x) => x.id === tab) || TABS[0];

  return (
    <div className="page page--admin">
      <div className="container container--wide">
        <div className="page-header">
          <h1 className="page-title page-title--lg">
            <span className="ac-title-icon" aria-hidden="true">
              {activeTab.icon}
            </span>
            {t(activeTab.label)}
          </h1>
          <Link to="/dashboard" className="link">
            ← {t("nav.dashboard")}
          </Link>
        </div>

        <div className="admin-panel">
          {tab === "overview" && <OverviewTab goTo={goTo} />}
          {tab === "users" && <UsersTab />}
          {tab === "properties" && <PropertiesTab />}
          {tab === "premium" && <PremiumTab />}
          {tab === "bookings" && <BookingsTab />}
          {tab === "payments" && <PaymentsTab />}
          {tab === "reviews" && <ReviewsTab />}
          {tab === "reports" && <ReportsTab />}
        </div>
      </div>
    </div>
  );
}
