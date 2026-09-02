import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";

export default function MyProperties() {
  const { t } = useLang();
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const loadMyProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/properties/my-properties", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProperties(res.data.properties);
      } catch (err) {
        console.error(err);
      }
    };

    loadMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/properties/my-properties", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProperties(res.data.properties);
    } catch (err) {
      console.error(err);
    }
  };

  async function handleDelete(id) {
    const confirmed = window.confirm(t("my.confirmDelete"));

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      await API.delete(`/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

        {properties.length === 0 ? (
          <div className="empty">{t("my.empty")}</div>
        ) : (
          <div className="grid grid--cards">
            {properties.map((property) => (
              <div key={property._id} className="property-card">
                <div className="property-card__body">
                  <h2 className="property-card__title">{property.title}</h2>

                  <p className="property-card__location">
                    📍 {property.location}
                  </p>

                  <p className="property-card__price">ETB {property.price}</p>

                  <div className="row row--wrap property-card__meta">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
