import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function AddProperty() {
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

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  }

  async function uploadImages() {
    if (images.length === 0) return [];

    const formData = new FormData();
    images.forEach((image) => formData.append("images", image));

    const res = await API.post("/properties/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.images;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage(t("add.uploading"));
      const uploadedImages = await uploadImages();

      setMessage(t("add.saving"));
      await API.post("/properties", {
        ...formData,
        images: uploadedImages,
      });

      setMessage("✅ " + t("add.success"));

      setTimeout(() => {
        navigate("/properties");
      }, 1200);
    } catch (err) {
      setMessage(
        "❌ " + (err.response?.data?.message || "Failed to add property.")
      );
    }
  }

  return (
    <div className="page page--form">
      <div className="container container--narrow">
        <div className="card card--pad-lg">
          <h1 className="page-title">{t("add.title")}</h1>

          {message && (
            <div className="alert alert--info" style={{ margin: "16px 0" }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form">
            <input
              name="title"
              placeholder={t("add.propertyTitle")}
              onChange={handleChange}
              className="input"
              required
            />

            <textarea
              name="description"
              placeholder={t("add.description")}
              onChange={handleChange}
              className="textarea"
              rows="4"
              required
            />

            <div className="grid grid--2">
              <input
                type="number"
                name="price"
                placeholder={t("add.price")}
                onChange={handleChange}
                className="input"
                required
              />

              <input
                name="location"
                placeholder={t("add.location")}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div className="grid grid--3">
              <input
                type="number"
                name="bedrooms"
                placeholder={t("add.bedrooms")}
                onChange={handleChange}
                className="input"
                required
              />

              <input
                type="number"
                name="bathrooms"
                placeholder={t("add.bathrooms")}
                onChange={handleChange}
                className="input"
                required
              />

              <input
                type="number"
                name="area"
                placeholder={t("add.area")}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <select name="propertyType" onChange={handleChange} className="select">
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`type.${type}`)}
                </option>
              ))}
            </select>

            <div className="form-group">
              <label className="label">{t("add.photos")}</label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="input"
              />

              {imagePreviews.length > 0 && (
                <div className="row row--wrap" style={{ marginTop: 12 }}>
                  {imagePreviews.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="thumb"
                    />
                  ))}
                </div>
              )}
            </div>

            <button className="btn btn--primary btn--lg btn--block">
              {t("add.button")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
