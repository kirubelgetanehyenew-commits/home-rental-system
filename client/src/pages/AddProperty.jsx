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

const TYPE_ICONS = {
  Apartment: "🏢",
  Villa: "🏡",
  House: "🏠",
  Studio: "🛏️",
  Condominium: "🏙️",
  Office: "💼",
  "Commercial Space": "🏪",
  Hostel: "🛌",
  "Shared Room": "👥",
  "Guest House": "🛖",
};

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
  const [fileInputKey, setFileInputKey] = useState(0);

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

  function removeImage(index) {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFileInputKey((k) => k + 1);
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
        navigate("/my-properties");
      }, 1200);
    } catch (err) {
      setMessage(
        "❌ " + (err.response?.data?.message || "Failed to add property.")
      );
    }
  }

  return (
    <div className="page page--form page--addprop">
      <div className="container container--narrow">
        <div className="addprop-hero">
          <span className="addprop-hero__icon">🏠</span>
          <div>
            <h1 className="addprop-hero__title">{t("add.title")}</h1>
            <p className="addprop-hero__sub">{t("add.subtitle")}</p>
          </div>
        </div>

        {message && (
          <div className="alert alert--info addprop-msg">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="addprop-form">
          {/* Step 1 — Basic information */}
          <section className="form-section">
            <div className="form-section__head">
              <span className="form-step">1</span>
              <h2>{t("add.step1")}</h2>
            </div>
            <div className="form-section__body form">
              <div className="form-group">
                <label className="label">{t("add.propertyTitle")}</label>
                <input
                  name="title"
                  placeholder={t("add.propertyTitle")}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">{t("add.description")}</label>
                <textarea
                  name="description"
                  placeholder={t("add.description")}
                  onChange={handleChange}
                  className="textarea"
                  rows="4"
                  required
                />
              </div>
            </div>
          </section>

          {/* Step 2 — Price & location */}
          <section className="form-section">
            <div className="form-section__head">
              <span className="form-step">2</span>
              <h2>{t("add.step2")}</h2>
            </div>
            <div className="form-section__body form">
              <div className="grid grid--2">
                <div className="form-group">
                  <label className="label">💵 {t("add.price")}</label>
                  <div className="input-affix">
                    <input
                      type="number"
                      name="price"
                      placeholder={t("add.price")}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                    <span className="input-affix__tag">ETB</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">📍 {t("add.location")}</label>
                  <input
                    name="location"
                    placeholder={t("add.location")}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Step 3 — Property details */}
          <section className="form-section">
            <div className="form-section__head">
              <span className="form-step">3</span>
              <h2>{t("add.step3")}</h2>
            </div>
            <div className="form-section__body form">
              <div className="form-group">
                <label className="label">{t("add.propertyType")}</label>
                <div className="ptype-grid">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`ptype-option${
                        formData.propertyType === type
                          ? " ptype-option--active"
                          : ""
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, propertyType: type })
                      }
                    >
                      <span className="ptype-option__icon">
                        {TYPE_ICONS[type]}
                      </span>
                      {t(`type.${type}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid--3">
                <div className="form-group">
                  <label className="label">🛏 {t("add.bedrooms")}</label>
                  <input
                    type="number"
                    name="bedrooms"
                    placeholder={t("add.bedrooms")}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">🛁 {t("add.bathrooms")}</label>
                  <input
                    type="number"
                    name="bathrooms"
                    placeholder={t("add.bathrooms")}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">📐 {t("add.area")}</label>
                  <input
                    type="number"
                    name="area"
                    placeholder={t("add.area")}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Step 4 — Photos */}
          <section className="form-section">
            <div className="form-section__head">
              <span className="form-step">4</span>
              <h2>{t("add.step4")}</h2>
            </div>
            <div className="form-section__body">
              <label className="dropzone" htmlFor="photo-input">
                <span className="dropzone__icon">📷</span>
                <span className="dropzone__text">{t("add.dropPhotos")}</span>
                {imagePreviews.length > 0 && (
                  <span className="dropzone__count">
                    {imagePreviews.length} / 5
                  </span>
                )}
              </label>

              <input
                id="photo-input"
                key={fileInputKey}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                hidden
              />

              {imagePreviews.length > 0 && (
                <div className="preview-grid">
                  {imagePreviews.map((src, index) => (
                    <div className="thumb-wrap" key={index}>
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className="thumb"
                      />
                      <button
                        type="button"
                        className="thumb-remove"
                        onClick={() => removeImage(index)}
                        aria-label={t("edit.removePhoto")}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="dropzone__hint">{t("add.coverHint")}</p>
            </div>
          </section>

          <button className="btn btn--primary btn--lg btn--block addprop-submit">
            🚀 {t("add.button")}
          </button>
        </form>
      </div>
    </div>
  );
}
