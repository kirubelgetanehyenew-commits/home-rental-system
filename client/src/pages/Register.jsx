import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const { t } = useLang();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "tenant",
  });

  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await API.post("/auth/register", formData);

      // Auto-login
      login(res.data.user, res.data.token);

      setMessage("✅ " + t("register.success"));

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }

    setLoading(false);
  }

  return (
    <div className="page page--auth">
      <div className="auth-split">
        <aside className="auth-split__hero">
          <Link to="/" className="navbar__brand">
            <span className="navbar__logo">🏠</span>
            <span className="navbar__brand-text">
              Home<span>Rental</span>
            </span>
          </Link>
          <h1 className="auth-hero__title">{t("auth.heroTitle")}</h1>
          <p className="auth-hero__tag">{t("auth.heroTag")}</p>
          <ul className="auth-points">
            <li className="auth-point">✅ {t("auth.point1")}</li>
            <li className="auth-point">📅 {t("auth.point2")}</li>
            <li className="auth-point">🔒 {t("auth.point3")}</li>
          </ul>
        </aside>

        <div className="auth-split__form">
          <div className="auth-card">
            <h2 className="auth-card__title">{t("register.title")}</h2>
            <p className="auth-card__subtitle">{t("register.subtitle")}</p>

            {message && <div className="alert alert--success">{message}</div>}
            {error && <div className="alert alert--error">{error}</div>}

            <form onSubmit={handleSubmit} className="form">
              <label className="field">
                <svg
                  className="field__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  name="fullName"
                  placeholder={t("form.fullName")}
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input field__input"
                  required
                />
              </label>

              <label className="field">
                <svg
                  className="field__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  name="email"
                  placeholder={t("form.email")}
                  value={formData.email}
                  onChange={handleChange}
                  className="input field__input"
                  required
                />
              </label>

              <label className="field">
                <svg
                  className="field__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <input
                  type="text"
                  name="phone"
                  placeholder={t("form.phone")}
                  value={formData.phone}
                  onChange={handleChange}
                  className="input field__input"
                  required
                />
              </label>

              <label className="field">
                <svg
                  className="field__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder={t("form.password")}
                  value={formData.password}
                  onChange={handleChange}
                  className="input field__input field__input--pass"
                  required
                />
                <button
                  type="button"
                  className="field__toggle"
                  onClick={() => setShowPass((s) => !s)}
                  title={showPass ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </label>

              <div className="role-cards">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "tenant" })}
                  className={`role-card${
                    formData.role === "tenant" ? " role-card--active" : ""
                  }`}
                >
                  <span className="role-card__icon">🏠</span>
                  <span className="role-card__label">{t("register.tenant")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "landlord" })}
                  className={`role-card${
                    formData.role === "landlord" ? " role-card--active" : ""
                  }`}
                >
                  <span className="role-card__icon">🏘️</span>
                  <span className="role-card__label">{t("register.landlord")}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn--primary btn--lg btn--block"
              >
                {loading ? t("register.loading") : t("register.button")}
              </button>
            </form>

            <p className="auth-card__footer">
              {t("register.haveAccount")}{" "}
              <Link to="/login" className="link">
                {t("register.logIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
