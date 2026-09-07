import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const EMAIL = "kirubegetanehyenew@gmail.com";
const PHONE = "+251 903431211";
const PHONE_HREF = "tel:+251903431211";
const GITHUB = "https://github.com/kirubelgetanehyenew-commits";

export default function Footer() {
  const { t, lang, toggleLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const year = new Date().getFullYear();

  const isLandlord = user?.role === "landlord";
  const isAdmin = user?.role === "admin";

  // Role-aware link columns
  const explore = [
    { to: "/", label: t("nav.home") },
    ...(user ? [{ to: "/properties", label: t("nav.properties") }] : []),
    ...(user ? [{ to: "/favorites", label: t("nav.favorites") }] : []),
    ...(user ? [{ to: "/messages", label: t("nav.messages") }] : []),
    ...(!user
      ? [
          { to: "/login", label: t("nav.login") },
          { to: "/register", label: t("nav.register") },
        ]
      : []),
  ];

  const account = isAdmin
    ? [
        { to: "/admin", label: t("admin.controlCenter") },
        { to: "/dashboard", label: t("nav.dashboard") },
        { to: "/profile", label: t("nav.profile") },
      ]
    : user
    ? [
        { to: "/dashboard", label: t("nav.dashboard") },
        ...(isLandlord
          ? [
              { to: "/my-properties", label: t("nav.myProperties") },
              { to: "/add-property", label: t("nav.addProperty") },
            ]
          : []),
        { to: "/bookings", label: t("nav.bookings") },
        { to: "/payments", label: t("payments.pageTitle") },
        { to: "/profile", label: t("nav.profile") },
      ]
    : [
        { to: "/register", label: t("home.getStarted") },
        { to: "/login", label: t("nav.login") },
      ];

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="footer">
      <button
        onClick={scrollTop}
        className="footer__top"
        title={t("footer.top")}
        aria-label={t("footer.top")}
      >
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
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>

      <div className="footer__grid">
        {/* Brand + socials */}
        <div className="footer__col">
          <Link to="/" className="navbar__brand">
            <span className="navbar__logo">🏠</span>
            <span className="navbar__brand-text">
              Home<span>Rental</span>
            </span>
          </Link>
          <p className="footer__tagline">{t("footer.tagline")}</p>
          <div className="footer__social">
            <a href={GITHUB} target="_blank" rel="noreferrer" title="GitHub">
              <svg
                className="icon-svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.66.41.36.78 1.06.78 2.14v3.17c0 .3.21.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
              </svg>
            </a>
            <a href={`mailto:${EMAIL}`} title={EMAIL}>
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
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 6L2 7" />
              </svg>
            </a>
            <a href={PHONE_HREF} title={PHONE}>
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
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Explore */}
        <div className="footer__col">
          <h4 className="footer__title">{t("footer.explore")}</h4>
          <nav className="footer__links">
            {explore.map((l) => (
              <Link key={l.to + l.label} to={l.to}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Account */}
        <div className="footer__col">
          <h4 className="footer__title">{t("footer.account")}</h4>
          <nav className="footer__links">
            {account.map((l) => (
              <Link key={l.to + l.label} to={l.to}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Contact */}
        <div className="footer__col">
          <h4 className="footer__title">{t("footer.contact")}</h4>
          <ul className="footer__contact">
            <li>
              <a href={`mailto:${EMAIL}`}>✉️ {EMAIL}</a>
            </li>
            <li>
              <a href={PHONE_HREF}>📞 {PHONE}</a>
            </li>
            <li>📍 Addis Ababa, Ethiopia</li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p>
          © {year} Home Rental System. {t("footer.rights")}
        </p>
        <div className="footer__utils">
          <button
            onClick={toggleLang}
            className="lang-btn"
            title={lang === "en" ? "ቋንቋ ቀይር" : "Switch language"}
          >
            {lang === "en" ? "አማ" : "EN"}
          </button>
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
        </div>
      </div>
    </footer>
  );
}
