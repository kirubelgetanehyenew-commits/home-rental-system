import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    propertyType: "",
  });

  const [message, setMessage] = useState("");

  async function fetchProperty() {
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
      console.log(err);
    }
  }

  useEffect(() => {
    fetchProperty();
  }, []);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await API.put(`/properties/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Property updated successfully!");

      setTimeout(() => {
        navigate("/properties");
      }, 1000);

    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        "Failed to update property."
      );
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10">

      <h1 className="text-3xl font-bold mb-6">
        Edit Property
      </h1>

      {message && (
        <div className="mb-4 p-3 bg-green-100 rounded">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          rows="4"
        />

        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          type="number"
          name="bedrooms"
          value={formData.bedrooms}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          type="number"
          name="bathrooms"
          value={formData.bathrooms}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          type="number"
          name="area"
          value={formData.area}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <select
          name="propertyType"
          value={formData.propertyType}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        >
          <option>Apartment</option>
          <option>House</option>
          <option>Villa</option>
          <option>Studio</option>
        </select>

        <button
          className="w-full bg-blue-600 text-white py-3 rounded"
        >
          Update Property
        </button>

      </form>

    </div>
  );
}