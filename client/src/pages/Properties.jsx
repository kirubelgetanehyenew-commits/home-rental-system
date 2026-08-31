import { useEffect, useState } from "react";
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

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white p-3 text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100 dark:placeholder:text-zinc-500";

const defaultFilters = {
  keyword: "",
  propertyType: "",
  minPrice: "",
  maxPrice: "",
  minBedrooms: "",
  sort: "newest",
};

export default function Properties() {
  const { user } = useAuth();
  const { t } = useLang();

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
        const params = {
          page,
          limit: 9,
          sort: filters.sort,
        };

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

  function handleChange(e) {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPage(1);
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
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

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">

      <h1 className="text-4xl font-bold mb-8">{t("properties.title")}</h1>

      {/* ============ Search & Filters ============ */}
      <form
        onSubmit={handleSearch}
        className="bg-white shadow-lg rounded-lg p-6 mb-8 dark:bg-zinc-900 dark:shadow-black/30"
      >
        <div className="grid gap-4 md:grid-cols-5">

          <input
            name="keyword"
            placeholder={t("properties.searchPlaceholder")}
            value={filters.keyword}
            onChange={handleChange}
            className={`${inputClass} md:col-span-2`}
          />

          <select
            name="propertyType"
            value={filters.propertyType}
            onChange={handleChange}
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
          />

          <input
            type="number"
            name="maxPrice"
            placeholder={t("properties.maxPrice")}
            value={filters.maxPrice}
            onChange={handleChange}
            className={inputClass}
          />

          <div className="flex gap-3 md:col-span-2">
            <button className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600">
              {t("properties.search")}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-stone-200 text-stone-700 py-3 rounded-lg font-semibold hover:bg-stone-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              {t("properties.reset")}
            </button>
          </div>

        </div>
      </form>

      <p className="text-stone-500 mb-4 dark:text-zinc-400">
        {total} {total === 1 ? t("properties.foundOne") : t("properties.found")}
      </p>

      {loading ? (
        <div className="text-center py-10 text-xl">{t("common.loading")}</div>
      ) : properties.length === 0 ? (
        <div className="rounded-lg bg-white shadow p-8 text-center dark:bg-zinc-900">
          <p className="text-stone-600 dark:text-zinc-400">
            {t("properties.none")}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
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

      {/* ============ Pagination ============ */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded bg-stone-200 disabled:opacity-50 hover:bg-stone-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            ← {t("properties.prev")}
          </button>

          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-10 w-10 rounded font-semibold ${
                p === page
                  ? "bg-orange-500 text-white"
                  : "bg-stone-200 hover:bg-stone-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-4 py-2 rounded bg-stone-200 disabled:opacity-50 hover:bg-stone-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            {t("properties.next")} →
          </button>
        </div>
      )}

    </div>
  );
}
