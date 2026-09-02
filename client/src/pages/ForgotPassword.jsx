import { useState } from "react";
import API from "../services/api";
import { useLang } from "../context/LanguageContext";

export default function ForgotPassword() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devUrl, setDevUrl] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    setDevUrl("");

    try {
      const res = await API.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "If that email exists, a reset link was sent");
      if (res.data.resetUrl) setDevUrl(res.data.resetUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    }
  }

  return (
    <div className="page page--auth">
      <div className="container container--narrow container--center">
        <div className="auth-card">
          <h1 className="auth-card__title">{t("forgot.title")}</h1>

          {message && <div className="alert alert--success">{message}</div>}
          {error && <div className="alert alert--error">{error}</div>}
          {devUrl && (
            <div className="alert alert--info">
              {t("forgot.devLink")}{" "}
              <a className="link" href={devUrl}>
                {devUrl}
              </a>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form">
            <input
              type="email"
              placeholder={t("form.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />

            <button className="btn btn--primary btn--lg btn--block">
              {t("forgot.button")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
