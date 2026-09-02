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
    <div className="property-card">
      <div className="property-card__media">
        <img
          src={imageUrl}
          alt={property.title}
          className="property-card__img"
        />

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
      </div>

      <div className="property-card__body">
        <Link to={`/property/${property._id}`} className="property-card__title">
          {property.title}
        </Link>

        <p className="property-card__location">📍 {property.location}</p>

        <div className="row row--between row--center">
          <p className="property-card__price">ETB {property.price}</p>

          {property.propertyType && (
            <span className="badge badge--brand">
              {t(`type.${property.propertyType}`)}
            </span>
          )}
        </div>

        <div className="row row--wrap property-card__meta">
          <Link to={`/property/${property._id}`} className="btn btn--primary btn--sm">
            {t("properties.viewDetails")}
          </Link>

          {showActions && (
            <>
              <Link
                to={`/edit-property/${property._id}`}
                className="btn btn--outline btn--sm"
              >
                {t("properties.edit")}
              </Link>

              <button
                onClick={() => onDelete(property._id)}
                className="btn btn--danger btn--sm"
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
