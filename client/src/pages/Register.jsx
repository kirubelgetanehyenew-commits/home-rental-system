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
      <div className="container container--narrow container--center">
        <div className="auth-card">
          <h1 className="auth-card__title">{t("register.title")}</h1>
          <p className="auth-card__subtitle">{t("register.subtitle")}</p>

          {message && <div className="alert alert--success">{message}</div>}
          {error && <div className="alert alert--error">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            <div className="grid grid--2">
              <input
                type="text"
                name="fullName"
                placeholder={t("form.fullName")}
                value={formData.fullName}
                onChange={handleChange}
                className="input"
                required
              />
              <input
                type="email"
                name="email"
                placeholder={t("form.email")}
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div className="grid grid--2">
              <input
                type="text"
                name="phone"
                placeholder={t("form.phone")}
                value={formData.phone}
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
            </div>

            <div className="role-select">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "tenant" })}
                className={`role-option${formData.role === "tenant" ? " role-option--active" : ""}`}
              >
                {t("register.tenant")}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "landlord" })}
                className={`role-option${formData.role === "landlord" ? " role-option--active" : ""}`}
              >
                {t("register.landlord")}
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn btn--primary btn--lg btn--block">
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
  );
}
