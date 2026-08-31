import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLang } from "../context/LanguageContext";

function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm font-medium transition ${
          isActive
            ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
            : "text-stone-600 hover:bg-stone-200/70 hover:text-stone-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate("/login");
  }

  const isLandlordOrAdmin = user && user.role && user.role !== "tenant";

  const mainLinks = (
    <>
      <NavItem to="/">{t("nav.home")}</NavItem>
      <NavItem to="/properties">{t("nav.properties")}</NavItem>
      {isLandlordOrAdmin && (
        <>
          <NavItem to="/my-properties">{t("nav.myProperties")}</NavItem>
          <NavItem to="/add-property">{t("nav.addProperty")}</NavItem>
        </>
      )}
      {user && (
        <>
          <NavItem to="/bookings">{t("nav.bookings")}</NavItem>
          <NavItem to="/favorites">{t("nav.favorites")}</NavItem>
          <NavItem to="/dashboard">{t("nav.dashboard")}</NavItem>
        </>
      )}
    </>
  );

  // Theme + language switchers (shared between desktop and mobile)
  const toggles = (
    <div className="flex items-center gap-2">
      {/* Day / night toggle */}
      <button
        onClick={toggleTheme}
        title={theme === "dark" ? "Switch to day mode" : "Switch to night mode"}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-lg transition hover:border-orange-400 dark:border-zinc-700 dark:hover:border-orange-400"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      {/* English / Amharic toggle */}
      <button
        onClick={toggleLang}
        title={lang === "en" ? "ቋንቋ ቀይር" : "Switch language"}
        className="flex h-10 items-center justify-center rounded-full border border-stone-300 px-3 text-sm font-semibold text-stone-700 transition hover:border-orange-400 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-orange-400"
      >
        {lang === "en" ? "አማ" : "EN"}
      </button>
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 text-stone-900 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ============ Top bar ============ */}
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-lg shadow-lg shadow-orange-500/25">
              🏠
            </span>
            <span className="text-xl font-bold tracking-tight">
              Home
              <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent dark:from-orange-400 dark:to-rose-400">
                Rental
              </span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 lg:flex">
            {mainLinks}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 lg:flex">
            {toggles}

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-full border border-stone-300 py-1 pl-1 pr-4 transition hover:border-orange-400 dark:border-zinc-700 dark:hover:border-orange-400"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/20 text-sm font-bold text-orange-600 dark:text-orange-400">
                      {(user.fullName || "U")[0].toUpperCase()}
                    </span>
                  )}
                  <span className="text-sm font-medium">
                    {user.fullName ? user.fullName.split(" ")[0] : t("nav.profile")}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium transition hover:border-orange-400 dark:border-zinc-700 dark:hover:border-orange-400"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile: toggles + hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            {toggles}

            <button
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-300 transition hover:border-orange-400 dark:border-zinc-700 dark:hover:border-orange-400"
            >
              <div className="space-y-1.5">
                <span
                  className={`block h-0.5 w-5 bg-stone-700 transition-transform dark:bg-zinc-200 ${
                    menuOpen ? "translate-y-2 rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-stone-700 transition-opacity dark:bg-zinc-200 ${
                    menuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-stone-700 transition-transform dark:bg-zinc-200 ${
                    menuOpen ? "-translate-y-2 -rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* ============ Mobile menu ============ */}
        {menuOpen && (
          <div className="border-t border-stone-200 py-4 dark:border-zinc-800 lg:hidden">
            <div className="flex flex-col gap-1">
              {mainLinks}
            </div>

            <div className="mt-4 border-t border-stone-200 pt-4 dark:border-zinc-800">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="mb-3 flex items-center gap-3 rounded-xl bg-stone-100 px-4 py-3 transition hover:bg-stone-200 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.fullName}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/20 font-bold text-orange-600 dark:text-orange-400">
                        {(user.fullName || "U")[0].toUpperCase()}
                      </span>
                    )}
                    <span className="font-medium">
                      {user.fullName || t("nav.profile")}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full rounded-full bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full border border-stone-300 px-4 py-2.5 text-center text-sm font-medium transition hover:border-orange-400 dark:border-zinc-700 dark:hover:border-orange-400"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full bg-orange-500 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-orange-600"
                  >
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </nav>
  );
}
