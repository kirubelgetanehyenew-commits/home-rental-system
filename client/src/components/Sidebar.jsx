import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";

function SideLink({ to, icon, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `side-link${isActive ? " side-link--active" : ""}`
      }
    >
      <span className="side-link__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="side-link__label">{children}</span>
    </NavLink>
  );
}

// Admin control-center link; active state is driven by the ?tab= query
// because every control area lives under the same /admin path.
function AdminSideLink({ tab, icon, active, children, onClick }) {
  return (
    <NavLink
      to={`/admin?tab=${tab}`}
      onClick={onClick}
      className={`side-link${active ? " side-link--active" : ""}`}
    >
      <span className="side-link__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="side-link__label">{children}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  const close = () => setOpen(false);
  const isLandlordOrAdmin = user && user.role && user.role !== "tenant";
  const isAdmin = user?.role === "admin";

  // Active admin control-center tab (from ?tab=)
  const onAdmin = location.pathname === "/admin";
  const currentTab =
    new URLSearchParams(location.search).get("tab") || "overview";

  const brand = (
    <Link to="/" className="navbar__brand" onClick={close}>
      <span className="navbar__logo">🏠</span>
      <span className="navbar__brand-text">
        Home<span>Rental</span>
      </span>
    </Link>
  );

  return (
    <>
      {/* Mobile top bar (hidden on desktop) */}
      <header className="topbar">
        <button
          className="icon-btn"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>
        {brand}
      </header>

      {open && <div className="sidebar-backdrop" onClick={close} />}

      <aside className={`sidebar${open ? " sidebar--open" : ""}`}>
        <div className="sidebar__brand">
          {brand}
        </div>

        <nav className="sidebar__nav">
          {isAdmin ? (
            <>
              <p className="sidebar__group">{t("admin.controlCenter")}</p>
              <AdminSideLink
                tab="overview"
                icon="📊"
                active={onAdmin && currentTab === "overview"}
                onClick={close}
              >
                {t("admin.tabOverview")}
              </AdminSideLink>
              <AdminSideLink
                tab="users"
                icon="👥"
                active={onAdmin && currentTab === "users"}
                onClick={close}
              >
                {t("admin.users")}
              </AdminSideLink>
              <AdminSideLink
                tab="properties"
                icon="🏠"
                active={onAdmin && currentTab === "properties"}
                onClick={close}
              >
                {t("admin.properties")}
              </AdminSideLink>
              <AdminSideLink
                tab="bookings"
                icon="📅"
                active={onAdmin && currentTab === "bookings"}
                onClick={close}
              >
                {t("admin.tabBookings")}
              </AdminSideLink>
              <AdminSideLink
                tab="payments"
                icon="💳"
                active={onAdmin && currentTab === "payments"}
                onClick={close}
              >
                {t("payments.pageTitle")}
              </AdminSideLink>
              <AdminSideLink
                tab="reviews"
                icon="⭐"
                active={onAdmin && currentTab === "reviews"}
                onClick={close}
              >
                {t("admin.statReviews")}
              </AdminSideLink>
              <AdminSideLink
                tab="reports"
                icon="🚩"
                active={onAdmin && currentTab === "reports"}
                onClick={close}
              >
                {t("admin.reports")}
              </AdminSideLink>
            </>
          ) : (
            <>
              <SideLink to="/" icon="🏠" onClick={close}>
                {t("nav.home")}
              </SideLink>
              {isLandlordOrAdmin && (
                <>
                  <SideLink to="/my-properties" icon="🏘️" onClick={close}>
                    {t("nav.myProperties")}
                  </SideLink>
                  <SideLink to="/add-property" icon="➕" onClick={close}>
                    {t("nav.addProperty")}
                  </SideLink>
                </>
              )}

              {user && (
                <>
                  <SideLink to="/properties" icon="🔎" onClick={close}>
                    {t("nav.properties")}
                  </SideLink>
                  <SideLink to="/bookings" icon="📅" onClick={close}>
                    {t("nav.bookings")}
                  </SideLink>
                  <SideLink to="/favorites" icon="❤️" onClick={close}>
                    {t("nav.favorites")}
                  </SideLink>
                  <SideLink to="/messages" icon="💬" onClick={close}>
                    {t("nav.messages")}
                  </SideLink>
                  <SideLink to="/payments" icon="💳" onClick={close}>
                    {t("payments.pageTitle")}
                  </SideLink>
                  <SideLink to="/dashboard" icon="📊" onClick={close}>
                    {t("nav.dashboard")}
                  </SideLink>
                </>
              )}
            </>
          )}
        </nav>

        <div className="sidebar__foot">
          {user ? (
            <button onClick={handleLogout} className="btn btn--outline btn--block">
              {t("nav.logout")}
            </button>
          ) : (
            <div className="sidebar__auth">
              <Link to="/login" className="btn btn--outline btn--block" onClick={close}>
                {t("nav.login")}
              </Link>
              <Link to="/register" className="btn btn--primary btn--block" onClick={close}>
                {t("nav.register")}
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
