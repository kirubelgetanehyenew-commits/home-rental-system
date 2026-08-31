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
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50 dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-black/30">
        <h2 className="text-2xl font-semibold mb-4">{t("verify.title")}</h2>

        {message && (
          <div className="mb-4 text-emerald-700 dark:text-emerald-300">{message}</div>
        )}
        {error && (
          <div className="mb-4 text-rose-700 dark:text-rose-300">{error}</div>
        )}
      </div>
    </div>
  );
}
