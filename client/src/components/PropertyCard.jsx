import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";

export default function PropertyCard({
  property,
  onDelete,
  showActions = false,
  favorited = false,
  onToggleFavorite,
}) {
  const { t } = useLang();

  const imageUrl =
    property.images && property.images.length > 0
      ? property.images[0]
      : "https://placehold.co/600x400?text=No+Image";

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition hover:-translate-y-0.5 dark:bg-zinc-900 dark:shadow-black/30">

      <div className="relative">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-56 object-cover"
        />

        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(property._id)}
            title={favorited ? t("details.saved") : t("details.save")}
            className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl shadow transition hover:scale-110"
          >
            {favorited ? "❤️" : "🤍"}
          </button>
        )}

        {!property.available && (
          <span className="absolute top-3 left-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
            {t("properties.rented")}
          </span>
        )}
      </div>

      <div className="p-4">

        <h2 className="text-2xl font-bold">
          {property.title}
        </h2>

        <p className="text-stone-500 mt-2 dark:text-zinc-400">
          📍 {property.location}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-orange-600 text-xl font-bold dark:text-orange-400">
            ETB {property.price}
          </p>

          {property.propertyType && (
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600 dark:bg-zinc-800 dark:text-zinc-300">
              {t(`type.${property.propertyType}`)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mt-4">

          <Link
            to={`/property/${property._id}`}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            {t("properties.viewDetails")}
          </Link>

          {showActions && (
            <>
              <Link
                to={`/edit-property/${property._id}`}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                {t("properties.edit")}
              </Link>

              <button
                onClick={() => onDelete(property._id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                {t("properties.delete")}
              </button>
            </>
          )}

        </div>

      </div>

    </div>
  );
}
