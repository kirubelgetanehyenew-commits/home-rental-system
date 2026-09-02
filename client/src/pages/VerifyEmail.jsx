import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useLang } from "../context/LanguageContext";

export default function VerifyEmail() {
  const { t } = useLang();
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function verify() {
      try {
        const res = await API.get(`/auth/verify-email/${token}`);
        setMessage(res.data.message || "Email verified");
        setTimeout(() => navigate("/login"), 1000);
      } catch (err) {
        setError(err.response?.data?.message || "Verification failed");
      }
    }

    if (token) verify();
  }, [token]);

  return (
    <div className="page page--auth">
      <div className="container container--narrow container--center">
        <div className="auth-card">
          <h1 className="auth-card__title">{t("verify.title")}</h1>

          {message && <div className="alert alert--success">{message}</div>}
          {error && <div className="alert alert--error">{error}</div>}
        </div>
      </div>
    </div>
  );
}
