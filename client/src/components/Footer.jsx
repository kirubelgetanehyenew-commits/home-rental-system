import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLang();
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__grid">
        {/* Brand + tagline */}
        <div className="footer__col">
          <Link to="/" className="navbar__brand">
            <span className="navbar__logo">🏠</span>
            <span className="navbar__brand-text">
              Home<span>Rental</span>
            </span>
          </Link>
          <p className="footer__tagline">{t("footer.tagline")}</p>
        </div>

        {/* Quick links */}
        <div className="footer__col">
          <h4 className="footer__title">{t("footer.quickLinks")}</h4>
          <nav className="footer__links">
            <Link to="/">{t("nav.home")}</Link>
            {user ? (
              <Link to="/dashboard">{t("nav.dashboard")}</Link>
            ) : (
              <Link to="/login">{t("nav.login")}</Link>
            )}
            {user ? (
              <Link to="/favorites">{t("nav.favorites")}</Link>
            ) : (
              <Link to="/register">{t("nav.register")}</Link>
            )}
          </nav>
        </div>

        {/* Contact */}
        <div className="footer__col">
          <h4 className="footer__title">{t("footer.contact")}</h4>
          <ul className="footer__contact">
            <li>✉️ kirubegetanehyenew@gmail.com</li>
            <li>📞 +251 903431211</li>
            <li>📍 Addis Ababa, Ethiopia</li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p>
          © {year} Home Rental System. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
