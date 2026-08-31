import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
        "❌ " +
        (err.response?.data?.message || "Failed to update property.")
      );
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">

      <h1 className="text-3xl font-bold mb-6">
        {t("edit.title")}
      </h1>

      {message && (
        <div className="mb-4 p-3 bg-stone-100 rounded dark:bg-zinc-800">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        <input
          name="title"
          placeholder={t("add.propertyTitle")}
          value={formData.title}
          onChange={handleChange}
          className={inputClass}
        />

        <textarea
          name="description"
          placeholder={t("add.description")}
          value={formData.description}
          onChange={handleChange}
          className={inputClass}
          rows="4"
        />

        <input
          type="number"
          name="price"
          placeholder={t("add.price")}
          value={formData.price}
          onChange={handleChange}
          className={inputClass}
        />

        <input
          name="location"
          placeholder={t("add.location")}
          value={formData.location}
          onChange={handleChange}
          className={inputClass}
        />

        <input
          type="number"
          name="bedrooms"
          placeholder={t("add.bedrooms")}
          value={formData.bedrooms}
          onChange={handleChange}
          className={inputClass}
        />

        <input
          type="number"
          name="bathrooms"
          placeholder={t("add.bathrooms")}
          value={formData.bathrooms}
          onChange={handleChange}
          className={inputClass}
        />

        <input
          type="number"
          name="area"
          placeholder={t("add.area")}
          value={formData.area}
          onChange={handleChange}
          className={inputClass}
        />

        <select
          name="propertyType"
          value={formData.propertyType}
          onChange={handleChange}
          className={inputClass}
        >
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`type.${type}`)}
            </option>
          ))}
        </select>

        <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600">
          {t("edit.button")}
        </button>

      </form>

    </div>
  );
}
