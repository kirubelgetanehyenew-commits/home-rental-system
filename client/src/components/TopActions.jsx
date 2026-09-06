import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLang } from "../context/LanguageContext";
import NotificationBell from "./NotificationBell";

// Permanent utility cluster pinned to the top-right corner of every page
export default function TopActions() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLang();

  return (
    <div className="top-actions">
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

      {user && <NotificationBell />}

      {user ? (
        <Link to="/profile" className="top-actions__profile" title={t("nav.profile")}>
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.fullName} className="avatar" />
          ) : (
            <span className="avatar">{(user?.fullName || "U")[0].toUpperCase()}</span>
          )}
          <span className="top-actions__name">{user?.fullName}</span>
        </Link>
      ) : (
        <Link to="/login" className="icon-btn" title={t("nav.login")}>
          👤
        </Link>
      )}
    </div>
  );
}
