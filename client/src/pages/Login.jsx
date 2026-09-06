import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLang();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await API.post("/auth/login", formData);

      login(res.data.user, res.data.token);
      setMessage("✅ " + t("dash.welcome") + "!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
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
            <h2 className="auth-card__title">{t("login.title")}</h2>
            <p className="auth-card__subtitle">{t("login.subtitle")}</p>

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

              <div style={{ textAlign: "right" }}>
                <Link to="/forgot-password" className="link">
                  {t("login.forgot")}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn--primary btn--lg btn--block"
              >
                {loading ? t("login.loading") : t("login.button")}
              </button>
            </form>

            <p className="auth-card__footer">
              {t("login.noAccount")}{" "}
              <Link to="/register" className="link">
                {t("login.createOne")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
