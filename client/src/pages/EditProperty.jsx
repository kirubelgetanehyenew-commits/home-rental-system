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

const PRICE_PERIODS = [
  { value: "month", icon: "🗓️" },
  { value: "week", icon: "📆" },
  { value: "day", icon: "☀️" },
  { value: "year", icon: "📅" },
];

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    pricePeriod: "month",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    propertyType: "Apartment",
  });

  const [images, setImages] = useState([]); // existing image URLs on the property
  const [newImages, setNewImages] = useState([]); // newly picked files
  const [newPreviews, setNewPreviews] = useState([]);

  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const res = await API.get(`/properties/${id}`);
        setFormData({
          title: res.data.property.title,
          description: res.data.property.description,
          price: res.data.property.price,
          pricePeriod: res.data.property.pricePeriod || "month",
          location: res.data.property.location,
          bedrooms: res.data.property.bedrooms,
          bathrooms: res.data.property.bathrooms,
          area: res.data.property.area,
          propertyType: res.data.property.propertyType,
        });
        setImages(res.data.property.images || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadProperty();
  }, [id]);

  function handleImageChange(e) {
    const files = Array.from(e.target.files).slice(0, 5);
    setNewImages(files);
    setNewPreviews(files.map((file) => URL.createObjectURL(file)));
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewImage(index) {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadNewImages() {
    if (newImages.length === 0) return [];

    const fd = new FormData();
    newImages.forEach((image) => fd.append("images", image));

    const res = await API.post("/properties/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.images;
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage(t("add.uploading"));
      const uploaded = await uploadNewImages();

      setMessage(t("add.saving"));
      await API.put(`/properties/${id}`, {
        ...formData,
        images: [...images, ...uploaded],
      });

      setMessage("✅ " + t("edit.success"));

      setTimeout(() => {
        navigate("/my-properties");
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

            <div className="form-group">
              <label className="label">⏳ {t("add.pricePeriod")}</label>
              <div className="ptype-grid">
                {PRICE_PERIODS.map((period) => (
                  <button
                    type="button"
                    key={period.value}
                    onClick={() =>
                      setFormData({ ...formData, pricePeriod: period.value })
                    }
                    className={`ptype-option${
                      formData.pricePeriod === period.value
                        ? " ptype-option--active"
                        : ""
                    }`}
                  >
                    <span className="ptype-option__icon">{period.icon}</span>
                    {t(`period.${period.value}`)}
                  </button>
                ))}
              </div>
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

            <div className="form-group">
              <label className="label">{t("add.photos")}</label>

              {images.length > 0 && (
                <div className="row row--wrap" style={{ marginBottom: 12 }}>
                  {images.map((src, index) => (
                    <div key={index} className="thumb-wrap">
                      <img
                        src={src}
                        alt={`Property ${index + 1}`}
                        className="thumb"
                      />
                      <button
                        type="button"
                        className="thumb-remove"
                        onClick={() => removeImage(index)}
                        title={t("edit.removePhoto")}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="input"
              />

              {newPreviews.length > 0 && (
                <div className="row row--wrap" style={{ marginTop: 12 }}>
                  {newPreviews.map((src, index) => (
                    <div key={index} className="thumb-wrap">
                      <img
                        src={src}
                        alt={`New preview ${index + 1}`}
                        className="thumb"
                      />
                      <button
                        type="button"
                        className="thumb-remove"
                        onClick={() => removeNewImage(index)}
                        title={t("edit.removePhoto")}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="btn btn--primary btn--lg btn--block">
              {t("edit.button")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
