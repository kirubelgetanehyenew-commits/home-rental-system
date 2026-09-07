import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useLang } from "../context/LanguageContext";

// Public header shown before login: brand plus language, theme and
// auth actions. Guests get this instead of the sidebar.
export default function PublicNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLang();

  return (
    <header className="public-navbar">
      <Link to="/" className="navbar__brand">
        <span className="navbar__logo">🏠</span>
        <span className="navbar__brand-text">
          Home<span>Rental</span>
        </span>
      </Link>

      <div className="public-navbar__actions">
        <button
          onClick={toggleTheme}
          className="icon-btn"
          title={theme === "dark" ? "Switch to day mode" : "Switch to night mode"}
        >
          {theme === "dark" ? (
            <svg
              className="icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          ) : (
            <svg
              className="icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <button
          onClick={toggleLang}
          className="lang-btn"
          title={lang === "en" ? "ቋንቋ ቀይር" : "Switch language"}
        >
          {lang === "en" ? "አማ" : "EN"}
        </button>

        <Link to="/login" className="btn btn--outline btn--sm">
          {t("nav.login")}
        </Link>
        <Link to="/register" className="btn btn--primary btn--sm">
          {t("nav.register")}
        </Link>
      </div>
    </header>
  );
}
