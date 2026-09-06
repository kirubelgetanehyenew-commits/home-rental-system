import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";

const AMENITY_FLAGS = [
  { key: "furnished", label: "amenity.Furnished", icon: "🛋️" },
  { key: "parking", label: "amenity.Parking", icon: "🚗" },
  { key: "internet", label: "amenity.Internet", icon: "📶" },
  { key: "balcony", label: "amenity.Balcony", icon: "🌇" },
  { key: "garden", label: "amenity.Garden", icon: "🌳" },
  { key: "swimmingPool", label: "amenity.Swimming Pool", icon: "🏊" },
  { key: "security", label: "amenity.Security", icon: "🛡️" },
  { key: "petAllowed", label: "amenity.Pets Allowed", icon: "🐾" },
];

export default function MyProperties() {
  const { t } = useLang();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProperties = async () => {
    try {
      const res = await API.get("/properties/my-properties");
      setProperties(res.data.properties);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, []);

  async function handleDelete(id) {
    const confirmed = window.confirm(t("my.confirmDelete"));

    if (!confirmed) return;

    try {
      await API.delete(`/properties/${id}`);
      fetchMyProperties();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="page page--properties">
      <div className="container container--wide">
        <div className="page-header">
          <h1 className="page-title page-title--lg">{t("my.title")}</h1>
          <Link to="/add-property" className="btn btn--primary">
            + {t("nav.addProperty")}
          </Link>
        </div>

        {loading ? (
          <div className="empty">…</div>
        ) : properties.length === 0 ? (
          <div className="empty">{t("my.empty")}</div>
        ) : (
          <div className="mp-list">
            {properties.map((property) => {
              const gallery =
                property.images?.length > 0
                  ? property.images.slice(0, 4)
                  : ["https://placehold.co/600x400?text=No+Image"];

              const amenities = AMENITY_FLAGS.filter((a) => property[a.key]);

              const locationParts = [
                property.location,
                property.subCity,
                property.city,
              ].filter(Boolean);

              return (
                <article key={property._id} className="mp-card">
                  <div className="mp-card__gallery">
                    {gallery.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`${property.title} ${i + 1}`}
                        className="mp-card__photo"
                      />
                    ))}
                    {property.images?.length > 1 && (
                      <span className="mp-card__count">
                        📷 {property.images.length}
                      </span>
                    )}
                  </div>

                  <div className="mp-card__content">
                    <div className="mp-card__head">
                      <div>
                        <Link
                          to={`/property/${property._id}`}
                          className="mp-card__title"
                        >
                          {property.title}
                        </Link>
                        {locationParts.length > 0 && (
                          <p className="mp-card__location">
                            📍 {locationParts.join(" · ")}
                          </p>
                        )}
                      </div>

                      <span
                        className={`mp-status mp-status--${
                          property.available ? "ok" : "off"
                        }`}
                      >
                        {property.available
                          ? t("my.available")
                          : t("properties.rented")}
                      </span>
                    </div>

                    <div className="mp-card__price-row">
                      <p className="mp-card__price">
                        ETB {property.price?.toLocaleString()}
                        <span className="mp-card__per">
                          {t("details.perMonth")}
                        </span>
                      </p>

                      <div className="row row--wrap">
                        <span className="badge badge--brand">
                          {t(`type.${property.propertyType}`)}
                        </span>
                        {property.deposit > 0 && (
                          <span className="badge badge--ghost">
                            {t("agreement.deposit")}: ETB{" "}
                            {property.deposit.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mp-specs">
                      <span className="mp-spec">🛏 {property.bedrooms || 0}</span>
                      <span className="mp-spec">🚿 {property.bathrooms || 0}</span>
                      <span className="mp-spec">📐 {property.area || 0} m²</span>
                      {property.floorNumber > 0 && (
                        <span className="mp-spec">
                          🏢 {property.floorNumber}
                          {property.totalFloors > 0
                            ? `/${property.totalFloors}`
                            : ""}
                        </span>
                      )}
                    </div>

                    {amenities.length > 0 && (
                      <div className="mp-amenities">
                        {amenities.map((a) => (
                          <span key={a.key} className="mp-amenity">
                            {a.icon} {t(a.label)}
                          </span>
                        ))}
                      </div>
                    )}

                    {property.description && (
                      <p className="mp-card__desc">{property.description}</p>
                    )}

                    <div className="mp-card__foot">
                      {property.createdAt && (
                        <span className="mp-card__date">
                          🕒 {t("my.listedOn")}{" "}
                          {new Date(property.createdAt).toLocaleDateString()}
                        </span>
                      )}

                      <div className="row row--wrap">
                        <Link
                          to={`/property/${property._id}`}
                          className="btn btn--primary btn--sm"
                        >
                          {t("properties.viewDetails")}
                        </Link>
                        <Link
                          to={`/edit-property/${property._id}`}
                          className="btn btn--outline btn--sm"
                        >
                          {t("properties.edit")}
                        </Link>
                        <button
                          onClick={() => handleDelete(property._id)}
                          className="btn btn--danger btn--sm"
                        >
                          {t("properties.delete")}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
