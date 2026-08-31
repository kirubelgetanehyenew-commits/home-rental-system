import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white p-3 text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100 dark:placeholder:text-zinc-500";

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
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-8 dark:bg-zinc-900 dark:shadow-black/30">
      <h1 className="text-3xl font-bold mb-6">
        {t("add.title")}
      </h1>

      {message && (
        <div className="mb-4 p-3 bg-stone-100 rounded dark:bg-zinc-800">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          name="title"
          placeholder={t("add.propertyTitle")}
          onChange={handleChange}
          className={inputClass}
          required
        />

        <textarea
          name="description"
          placeholder={t("add.description")}
          onChange={handleChange}
          className={inputClass}
          rows="4"
          required
        />

        <input
          type="number"
          name="price"
          placeholder={t("add.price")}
          onChange={handleChange}
          className={inputClass}
          required
        />

        <input
          name="location"
          placeholder={t("add.location")}
          onChange={handleChange}
          className={inputClass}
          required
        />

        <input
          type="number"
          name="bedrooms"
          placeholder={t("add.bedrooms")}
          onChange={handleChange}
          className={inputClass}
          required
        />

        <input
          type="number"
          name="bathrooms"
          placeholder={t("add.bathrooms")}
          onChange={handleChange}
          className={inputClass}
          required
        />

        <input
          type="number"
          name="area"
          placeholder={t("add.area")}
          onChange={handleChange}
          className={inputClass}
          required
        />

        <select
          name="propertyType"
          onChange={handleChange}
          className={inputClass}
        >
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`type.${type}`)}
            </option>
          ))}
        </select>

        <div>
          <label className="block text-sm font-semibold text-stone-600 mb-1 dark:text-zinc-300">
            {t("add.photos")}
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full rounded-lg border border-stone-300 p-3 dark:border-zinc-700 dark:bg-zinc-950/80"
          />

          {imagePreviews.length > 0 && (
            <div className="flex gap-2 mt-3">
              {imagePreviews.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Preview ${index + 1}`}
                  className="h-20 w-24 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>

        <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600">
          {t("add.button")}
        </button>

      </form>
    </div>
  );
}
