import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useLang } from "../context/LanguageContext";

export default function ResetPassword() {
  const { t } = useLang();
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await API.put(`/auth/reset-password/${token}`, { password });
      setMessage(res.data.message || "Password reset successful");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  }

  return (
    <div className="page page--auth">
      <div className="container container--narrow container--center">
        <div className="auth-card">
          <h1 className="auth-card__title">{t("reset.title")}</h1>

          {message && <div className="alert alert--success">{message}</div>}
          {error && <div className="alert alert--error">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            <input
              type="password"
              placeholder={t("reset.newPassword")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
            />

            <button className="btn btn--primary btn--lg btn--block">
              {t("reset.button")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
