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
    <div className="max-w-7xl mx-auto py-10 px-6">

      <h1 className="text-4xl font-bold mb-8">
        {t("my.title")}
      </h1>

      {properties.length === 0 ? (
        <p className="text-stone-600 dark:text-zinc-400">{t("my.empty")}</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">

          {properties.map((property) => (
            <div
              key={property._id}
              className="bg-white rounded-lg shadow p-5 dark:bg-zinc-900 dark:shadow-black/30"
            >
              <h2 className="text-xl font-bold">
                {property.title}
              </h2>

              <p className="text-stone-500 dark:text-zinc-400">
                {property.location}
              </p>

              <p className="font-bold text-orange-600 mt-2 dark:text-orange-400">
                ETB {property.price}
              </p>

              <div className="flex gap-3 mt-5">

                <Link
                  to={`/edit-property/${property._id}`}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  {t("properties.edit")}
                </Link>

                <button
                  onClick={() => handleDelete(property._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  {t("properties.delete")}
                </button>

              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}