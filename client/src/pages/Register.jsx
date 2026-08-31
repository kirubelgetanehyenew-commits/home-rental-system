import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";

const inputClass =
  "w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100 dark:placeholder:text-zinc-500";

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
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50 dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-black/30">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-semibold">{t("register.title")}</h1>
          <p className="mt-3 text-stone-500 dark:text-zinc-400">
            {t("register.subtitle")}
          </p>
        </div>

        {message && (
          <div className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-700 dark:text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              name="fullName"
              placeholder={t("form.fullName")}
              value={formData.fullName}
              onChange={handleChange}
              className={inputClass}
              required
            />
            <input
              type="email"
              name="email"
              placeholder={t("form.email")}
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              name="phone"
              placeholder={t("form.phone")}
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
              required
            />
            <input
              type="password"
              name="password"
              placeholder={t("form.password")}
              value={formData.password}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="tenant">{t("register.tenant")}</option>
            <option value="landlord">{t("register.landlord")}</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-orange-500 py-3 text-base font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t("register.loading") : t("register.button")}
          </button>
        </form>

        <p className="mt-6 text-center text-stone-500 dark:text-zinc-400">
          {t("register.haveAccount")}{" "}
          <Link
            to="/login"
            className="font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
          >
            {t("register.logIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
