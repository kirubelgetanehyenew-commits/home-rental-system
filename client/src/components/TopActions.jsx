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
        {theme === "dark" ? "☀️" : "🌙"}
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
