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
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50 dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-black/30">
        <h2 className="text-2xl font-semibold mb-4">{t("reset.title")}</h2>

        {message && (
          <div className="mb-4 text-emerald-700 dark:text-emerald-300">{message}</div>
        )}
        {error && (
          <div className="mb-4 text-rose-700 dark:text-rose-300">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder={t("reset.newPassword")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />

          <button className="w-full rounded-full bg-orange-500 py-3 text-white font-semibold hover:bg-orange-600">
            {t("reset.button")}
          </button>
        </form>
      </div>
    </div>
  );
}
