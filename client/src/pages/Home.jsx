import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";
import PropertyCard from "../components/PropertyCard";

export default function Home() {
  const { t } = useLang();
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await API.get("/properties", { params: { limit: 3 } });
        setFeatured(res.data.properties || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadFeatured();
  }, []);

  const stats = [
    { value: "500+", label: t("home.stats.properties") },
    { value: "1,200+", label: t("home.stats.tenants") },
    { value: "12", label: t("home.stats.cities") },
    { value: "300+", label: t("home.stats.landlords") },
  ];

  const steps = [
    { icon: "1️⃣", title: t("home.how.step1"), desc: t("home.how.step1.desc") },
    { icon: "2️⃣", title: t("home.how.step2"), desc: t("home.how.step2.desc") },
    { icon: "3️⃣", title: t("home.how.step3"), desc: t("home.how.step3.desc") },
  ];

  return (
    <div className="page page--home">
      <div className="container container--wide">
        {/* ---------- Hero ---------- */}
        <section className="hero">
          <span className="hero__eyebrow">{t("home.tagline")}</span>
          <h1 className="hero__title">{t("home.title")}</h1>
          <p className="hero__subtitle">{t("home.subtitle")}</p>

          <div className="hero__actions">
            <Link to="/properties" className="btn btn--primary btn--lg">
              {t("home.browse")}
            </Link>
            <Link
              to={user ? "/dashboard" : "/register"}
              className="btn btn--outline btn--lg"
            >
              {user ? t("nav.dashboard") : t("home.getStarted")}
            </Link>
          </div>
        </section>

        {/* ---------- Quick search ---------- */}
        <section className="search-bar">
          <h2 className="search-bar__title">{t("home.quickTitle")}</h2>
          <div className="search-bar__grid">
            <input type="text" placeholder={t("home.location")} className="input" />
            <input type="number" placeholder={t("home.maxPrice")} className="input" />
            <select className="select">
              <option>{t("home.bedrooms")}</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4+</option>
            </select>
            <Link to="/properties" className="btn btn--primary">
              {t("home.search")}
            </Link>
          </div>
        </section>

        {/* ---------- Stats band ---------- */}
        <section className="stats-band">
          {stats.map((s) => (
            <div className="stats-band__item" key={s.label}>
              <p className="stats-band__value">{s.value}</p>
              <p className="stats-band__label">{s.label}</p>
            </div>
          ))}
        </section>

        {/* ---------- Featured properties ---------- */}
        <section className="section">
          <div
            className="row row--wrap"
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2 className="section__title" style={{ margin: 0 }}>
              {t("home.featured.title")}
            </h2>
            <Link to="/properties" className="link">
              {t("home.browse")} →
            </Link>
          </div>

          {featured.length ? (
            <div className="grid grid--cards">
              {featured.map((p) => (
                <PropertyCard key={p._id} property={p} />
              ))}
            </div>
          ) : (
            <p className="soft">{t("common.loading")}</p>
          )}
        </section>

        {/* ---------- How it works ---------- */}
        <section className="section">
          <h2 className="section__title center">{t("home.how.title")}</h2>
          <div className="grid grid--3">
            {steps.map((s) => (
              <div className="feature-card" key={s.title}>
                <div className="feature-card__icon">{s.icon}</div>
                <h3 className="feature-card__title">{s.title}</h3>
                <p className="feature-card__text">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Why choose us ---------- */}
        <section className="section">
          <h2 className="section__title center">{t("home.whyTitle")}</h2>
          <div className="grid grid--3">
            {[
              { icon: "✅", title: t("home.verified.title"), desc: t("home.verified.desc") },
              { icon: "🔍", title: t("home.smart.title"), desc: t("home.smart.desc") },
              { icon: "🔒", title: t("home.secure.title"), desc: t("home.secure.desc") },
            ].map((card) => (
              <div key={card.title} className="feature-card">
                <div className="feature-card__icon">{card.icon}</div>
                <h3 className="feature-card__title">{card.title}</h3>
                <p className="feature-card__text">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Landlord CTA ---------- */}
        <section className="cta-band">
          <div>
            <h2 className="cta-band__title">{t("home.cta.title")}</h2>
            <p className="cta-band__desc">{t("home.cta.desc")}</p>
          </div>
          <Link
            to={user ? "/add-property" : "/register"}
            className="btn btn--light btn--lg"
          >
            {t("home.cta.button")}
          </Link>
        </section>
      </div>
    </div>
  );
}
