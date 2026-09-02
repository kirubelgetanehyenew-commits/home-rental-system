import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";

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

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    propertyType: "Apartment",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const res = await API.get(`/properties/${id}`);
        setFormData({
          title: res.data.property.title,
          description: res.data.property.description,
          price: res.data.property.price,
          location: res.data.property.location,
          bedrooms: res.data.property.bedrooms,
          bathrooms: res.data.property.bathrooms,
          area: res.data.property.area,
          propertyType: res.data.property.propertyType,
        });
      } catch (err) {
        console.error(err);
      }
    };

    loadProperty();
  }, [id]);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await API.put(`/properties/${id}`, formData);

      setMessage("✅ " + t("edit.success"));

      setTimeout(() => {
        navigate("/properties");
      }, 1000);
    } catch (err) {
      setMessage(
        "❌ " + (err.response?.data?.message || "Failed to update property.")
      );
    }
  }

  return (
    <div className="page page--form">
      <div className="container container--narrow">
        <div className="card card--pad-lg">
          <h1 className="page-title">{t("edit.title")}</h1>

          {message && (
            <div className="alert alert--info" style={{ margin: "16px 0" }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form">
            <input
              name="title"
              placeholder={t("add.propertyTitle")}
              value={formData.title}
              onChange={handleChange}
              className="input"
            />

            <textarea
              name="description"
              placeholder={t("add.description")}
              value={formData.description}
              onChange={handleChange}
              className="textarea"
              rows="4"
            />

            <div className="grid grid--2">
              <input
                type="number"
                name="price"
                placeholder={t("add.price")}
                value={formData.price}
                onChange={handleChange}
                className="input"
              />

              <input
                name="location"
                placeholder={t("add.location")}
                value={formData.location}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="grid grid--3">
              <input
                type="number"
                name="bedrooms"
                placeholder={t("add.bedrooms")}
                value={formData.bedrooms}
                onChange={handleChange}
                className="input"
              />

              <input
                type="number"
                name="bathrooms"
                placeholder={t("add.bathrooms")}
                value={formData.bathrooms}
                onChange={handleChange}
                className="input"
              />

              <input
                type="number"
                name="area"
                placeholder={t("add.area")}
                value={formData.area}
                onChange={handleChange}
                className="input"
              />
            </div>

            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="select"
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`type.${type}`)}
                </option>
              ))}
            </select>

            <button className="btn btn--primary btn--lg btn--block">
              {t("edit.button")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
