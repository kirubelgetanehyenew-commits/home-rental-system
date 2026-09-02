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
      <div className="page page--plain">
        <div className="container">
          <div className="loading">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--plain">
      <div className="container container--wide">
        <h1 className="page-title page-title--lg">{t("favorites.title")}</h1>

        {favorites.length === 0 ? (
          <div className="empty">{t("favorites.empty")}</div>
        ) : (
          <div className="grid grid--cards">
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
    </div>
  );
}
