import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";
import PropertyCard from "../components/PropertyCard";

const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "House",
  "Studio",
  "Condominium",
  "Office",
  "Commercial Space",
  "Hostel",
  "Shared Room",
  "Guest House",
];

const defaultFilters = {
  keyword: "",
  propertyType: "",
  minPrice: "",
  maxPrice: "",
  minBedrooms: "",
  sort: "newest",
};

export default function Home() {
  const { t } = useLang();
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [favoritedIds, setFavoritedIds] = useState([]);

  // Load favorited ids when logged in
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const res = await API.get("/favorites/ids");
        setFavoritedIds(res.data.favoritedIds);
      } catch (err) {
        // Not logged in
      }
    };

    if (user) loadFavorites();
  }, [user]);

  // Fetch properties whenever filters or page change
  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);

      try {
        const params = { page, limit: 9, sort: filters.sort };

        if (filters.keyword) params.keyword = filters.keyword;
        if (filters.propertyType) params.propertyType = filters.propertyType;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.minBedrooms) params.minBedrooms = filters.minBedrooms;

        const res = await API.get("/properties", { params });
        setProperties(res.data.properties);
        setPages(res.data.pages);
        setTotal(res.data.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [filters, page]);

  // Reveal sections as they scroll into view
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("reveal--in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  function handleChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
  }

  function handleReset() {
    setFilters(defaultFilters);
    setPage(1);
  }

  const handleToggleFavorite = async (propertyId) => {
    if (!user) {
      alert(t("details.loginTo") + "!");
      return;
    }

    try {
      const res = await API.post(`/favorites/${propertyId}`);
      setFavoritedIds((prev) =>
        res.data.favorited
          ? [...prev, propertyId]
          : prev.filter((pid) => pid !== propertyId)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(t("properties.confirmDelete"));

    if (!confirmed) return;

    try {
      await API.delete(`/properties/${id}`);

      const res = await API.get("/properties", {
        params: { page, limit: 9 },
      });
      setProperties(res.data.properties);
    } catch (err) {
      console.log(err);
    }
  };

  const stats = [
    { value: "500+", label: t("home.stats.properties"), icon: "🏠" },
    { value: "1,200+", label: t("home.stats.tenants"), icon: "😊" },
    { value: "12", label: t("home.stats.cities"), icon: "📍" },
    { value: "300+", label: t("home.stats.landlords"), icon: "🤝" },
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
          <div className="hero__glow hero__glow--1" aria-hidden="true" />
          <div className="hero__glow hero__glow--2" aria-hidden="true" />

          <span className="hero__eyebrow">{t("home.tagline")}</span>
          <h1 className="hero__title">{t("home.title")}</h1>
          <p className="hero__subtitle">{t("home.subtitle")}</p>

          <form onSubmit={handleSearch} className="hero__search">
            <input
              name="keyword"
              placeholder={t("properties.searchPlaceholder")}
              value={filters.keyword}
              onChange={handleChange}
              className="hero__search-input"
            />
            <select
              name="propertyType"
              value={filters.propertyType}
              onChange={handleChange}
              className="hero__search-select"
            >
              <option value="">{t("properties.allTypes")}</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`type.${type}`)}
                </option>
              ))}
            </select>
            <button className="btn btn--primary btn--lg">
              {t("properties.search")}
            </button>
          </form>

          <div className="hero__types">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setFilters({ ...filters, propertyType: type });
                  setPage(1);
                  document
                    .getElementById("listings")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`type-chip${
                  filters.propertyType === type ? " type-chip--active" : ""
                }`}
              >
                {t(`type.${type}`)}
              </button>
            ))}
          </div>

          <div className="hero__actions">
            <a href="#listings" className="btn btn--primary btn--lg">
              {t("home.browse")}
            </a>
            <Link
              to={user ? "/dashboard" : "/register"}
              className="btn btn--outline btn--lg"
            >
              {user ? t("nav.dashboard") : t("home.getStarted")}
            </Link>
          </div>
        </section>

        {/* ---------- Listings: search, filters, grid ---------- */}
        <section className="section reveal" id="listings">
          <h2 className="section__title">{t("properties.title")}</h2>

          <form onSubmit={handleSearch} className="card" style={{ marginBottom: 24 }}>
            <div className="grid grid--3">
              <input
                name="keyword"
                placeholder={t("properties.searchPlaceholder")}
                value={filters.keyword}
                onChange={handleChange}
                className="input"
              />

              <select
                name="propertyType"
                value={filters.propertyType}
                onChange={handleChange}
                className="select"
              >
                <option value="">{t("properties.allTypes")}</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`type.${type}`)}
                  </option>
                ))}
              </select>

              <select
                name="minBedrooms"
                value={filters.minBedrooms}
                onChange={handleChange}
                className="select"
              >
                <option value="">{t("properties.anyBedrooms")}</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}+ {t("properties.bedroomsMin")}
                  </option>
                ))}
              </select>

              <select
                name="sort"
                value={filters.sort}
                onChange={handleChange}
                className="select"
              >
                <option value="newest">{t("properties.sort.newest")}</option>
                <option value="oldest">{t("properties.sort.oldest")}</option>
                <option value="price_asc">{t("properties.sort.priceAsc")}</option>
                <option value="price_desc">{t("properties.sort.priceDesc")}</option>
              </select>

              <input
                type="number"
                name="minPrice"
                placeholder={t("properties.minPrice")}
                value={filters.minPrice}
                onChange={handleChange}
                className="input"
              />

              <input
                type="number"
                name="maxPrice"
                placeholder={t("properties.maxPrice")}
                value={filters.maxPrice}
                onChange={handleChange}
                className="input"
              />

              <div className="row">
                <button className="btn btn--primary spread">
                  {t("properties.search")}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn--outline spread"
                >
                  {t("properties.reset")}
                </button>
              </div>
            </div>
          </form>

          <p className="soft" style={{ marginBottom: 16 }}>
            {total} {total === 1 ? t("properties.foundOne") : t("properties.found")}
          </p>

          {loading ? (
            <div className="loading">{t("common.loading")}</div>
          ) : properties.length === 0 ? (
            <div className="empty">{t("properties.none")}</div>
          ) : (
            <div className="grid grid--cards">
              {properties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  showActions={user?.id === property.owner?._id}
                  onDelete={handleDelete}
                  favorited={favoritedIds.includes(property._id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="tabs" style={{ justifyContent: "center", marginTop: 40 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="tab"
              >
                ← {t("properties.prev")}
              </button>

              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`tab${p === page ? " tab--active" : ""}`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="tab"
              >
                {t("properties.next")} →
              </button>
            </div>
          )}
        </section>

        {/* ---------- Stats band ---------- */}
        <section className="stats-band reveal">
          {stats.map((s) => (
            <div className="stats-band__item" key={s.label}>
              <span className="stats-band__icon">{s.icon}</span>
              <p className="stats-band__value">{s.value}</p>
              <p className="stats-band__label">{s.label}</p>
            </div>
          ))}
        </section>

        {/* ---------- How it works ---------- */}
        <section className="section reveal">
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
        <section className="section reveal">
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
        <section className="cta-band reveal">
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
