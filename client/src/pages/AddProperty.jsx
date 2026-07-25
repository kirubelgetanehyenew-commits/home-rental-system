import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function AddProperty() {
  const navigate = useNavigate();

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

      await API.post("/properties", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Property added successfully!");

      setTimeout(() => {
        navigate("/properties");
      }, 1200);

    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to add property."
      );
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
      <h1 className="text-3xl font-bold mb-6">
        Add Property
      </h1>

      {message && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          name="title"
          placeholder="Property Title"
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          className="w-full border p-3 rounded"
          rows="4"
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          name="location"
          placeholder="Location"
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="number"
          name="bedrooms"
          placeholder="Bedrooms"
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="number"
          name="bathrooms"
          placeholder="Bathrooms"
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="number"
          name="area"
          placeholder="Area (m²)"
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <select
          name="propertyType"
          onChange={handleChange}
          className="w-full border p-3 rounded"
        >
          <option>Apartment</option>
          <option>House</option>
          <option>Villa</option>
          <option>Studio</option>
        </select>

        <button
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
        >
          Add Property
        </button>

      </form>
    </div>
  );
}