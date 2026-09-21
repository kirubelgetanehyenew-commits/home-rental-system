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

  const hasImage = property.images && property.images.length > 0;

  return (
    <div className="property-card">
      <div
        className={`property-card__media${
          hasImage ? "" : " property-card__media--empty"
        }`}
      >
        {hasImage ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="property-card__img"
          />
        ) : (
          <span className="property-card__noimg">🏠</span>
        )}

        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(property._id)}
            title={favorited ? t("details.saved") : t("details.save")}
            className="property-card__fav"
          >
            {favorited ? "❤️" : "🤍"}
          </button>
        )}

        {!property.available && (
          <span className="property-card__badge">
            {t("properties.rented")}
          </span>
        )}

        {property.propertyType && (
          <span className="property-card__type">
            {t(`type.${property.propertyType}`)}
          </span>
        )}
      </div>

      <div className="property-card__body">
        <Link to={`/property/${property._id}`} className="property-card__title">
          {property.title}
        </Link>

        <p className="property-card__location">
          📍 {property.location || property.city || property.address || "—"}
        </p>

        <div className="property-card__specs">
          <span>🛏 {property.bedrooms}</span>
          <span>🛁 {property.bathrooms}</span>
          <span>📐 {property.area} m²</span>
        </div>

        <p className="property-card__price">
          {Number(property.price).toLocaleString()}{" "}
          <small>ETB {t("details.perMonth")}</small>
        </p>

        <div className="property-card__actions">
          <Link
            to={`/property/${property._id}`}
            className="btn btn--primary btn--sm property-card__view"
          >
            {t("properties.viewDetails")}
          </Link>

          {showActions && (
            <>
              <Link
                to={`/edit-property/${property._id}`}
                className="btn btn--outline btn--sm"
              >
                ✏️ {t("properties.edit")}
              </Link>

              <button
                onClick={() => onDelete(property._id)}
                className="btn btn--danger btn--sm"
              >
                🗑 {t("properties.delete")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
