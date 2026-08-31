import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";

export default function Home() {
  const { t } = useLang();

  return (
    <div>
      <section className="relative overflow-hidden py-24 text-stone-900 dark:text-zinc-100">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-r from-orange-300/30 via-transparent to-rose-300/20 blur-3xl dark:from-orange-500/15 dark:to-rose-500/10" />
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-orange-600/90 dark:text-orange-400/90">
            {t("home.tagline")}
          </p>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight">
            {t("home.title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600 dark:text-zinc-300">
            {t("home.subtitle")}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
            <Link
              to="/properties"
              className="inline-flex items-center justify-center rounded-full bg-orange-500 px-7 py-3 text-base font-semibold text-white transition hover:bg-orange-600"
            >
              {t("home.browse")}
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white/80 px-7 py-3 text-base font-semibold text-stone-700 transition hover:border-orange-400 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:border-orange-400"
            >
              {t("home.getStarted")}
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50 dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-black/30">
          <h2 className="text-3xl font-semibold mb-6">{t("home.quickTitle")}</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <input
              type="text"
              placeholder={t("home.location")}
              className="rounded-3xl border border-stone-300 bg-white px-4 py-3 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:placeholder:text-zinc-500"
            />
            <input
              type="number"
              placeholder={t("home.maxPrice")}
              className="rounded-3xl border border-stone-300 bg-white px-4 py-3 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:placeholder:text-zinc-500"
            />
            <select className="rounded-3xl border border-stone-300 bg-white px-4 py-3 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80">
              <option>{t("home.bedrooms")}</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4+</option>
            </select>
            <button className="rounded-3xl bg-orange-500 py-3 text-base font-semibold text-white transition hover:bg-orange-600">
              {t("home.search")}
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-semibold text-center mb-10">
          {t("home.whyTitle")}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: "✅", title: t("home.verified.title"), desc: t("home.verified.desc") },
            { icon: "🔍", title: t("home.smart.title"), desc: t("home.smart.desc") },
            { icon: "🔒", title: t("home.secure.title"), desc: t("home.secure.desc") },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-stone-200 bg-white p-8 shadow-lg shadow-stone-200/50 transition hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-black/30"
            >
              <div className="mb-3 text-3xl">{card.icon}</div>
              <h3 className="text-xl font-semibold text-orange-600 mb-3 dark:text-orange-400">
                {card.title}
              </h3>
              <p className="text-stone-600 dark:text-zinc-300">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
