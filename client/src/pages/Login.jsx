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
      <div className="container container--narrow container--center">
        <div className="auth-card">
          <h1 className="auth-card__title">{t("login.title")}</h1>
          <p className="auth-card__subtitle">{t("login.subtitle")}</p>

          {message && <div className="alert alert--success">{message}</div>}
          {error && <div className="alert alert--error">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            <input
              type="email"
              name="email"
              placeholder={t("form.email")}
              value={formData.email}
              onChange={handleChange}
              className="input"
              required
            />

            <input
              type="password"
              name="password"
              placeholder={t("form.password")}
              value={formData.password}
              onChange={handleChange}
              className="input"
              required
            />

            <div style={{ textAlign: "right" }}>
              <Link to="/forgot-password" className="link">
                {t("login.forgot")}
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn btn--primary btn--lg btn--block">
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
  );
}
