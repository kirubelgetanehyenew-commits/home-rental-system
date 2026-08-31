import { useEffect, useState } from "react";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";
import PropertyCard from "../components/PropertyCard";

export default function Favorites() {
  const { t } = useLang();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      const res = await API.get("/favorites");
      setFavorites(res.data.favorites);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleToggleFavorite = async (propertyId) => {
    try {
      await API.post(`/favorites/${propertyId}`);
      loadFavorites();
    } catch (err) {
      console.error(err);
      alert("Failed to update favorites.");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-20 text-xl">{t("common.loading")}</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">

      <h1 className="text-4xl font-bold mb-8">{t("favorites.title")}</h1>

      {favorites.length === 0 ? (
        <div className="rounded-lg bg-white shadow p-8 text-center dark:bg-zinc-900">
          <p className="text-stone-600 dark:text-zinc-400">
            {t("favorites.empty")}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {favorites
            .filter((fav) => fav.property)
            .map((fav) => (
              <PropertyCard
                key={fav._id}
                property={fav.property}
                favorited
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
        </div>
      )}

    </div>
  );
}
