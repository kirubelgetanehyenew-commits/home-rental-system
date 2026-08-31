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
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50 dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-black/30">
        <h2 className="text-2xl font-semibold mb-4">{t("forgot.title")}</h2>

        {message && (
          <div className="mb-4 text-emerald-700 dark:text-emerald-300">{message}</div>
        )}
        {error && (
          <div className="mb-4 text-rose-700 dark:text-rose-300">{error}</div>
        )}
        {devUrl && (
          <div className="mb-4 text-stone-600 dark:text-zinc-300">
            {t("forgot.devLink")}{" "}
            <a className="text-orange-600 hover:underline dark:text-orange-400" href={devUrl}>
              {devUrl}
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t("form.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />

          <button className="w-full rounded-full bg-orange-500 py-3 text-white font-semibold hover:bg-orange-600">
            {t("forgot.button")}
          </button>
        </form>
      </div>
    </div>
  );
}
