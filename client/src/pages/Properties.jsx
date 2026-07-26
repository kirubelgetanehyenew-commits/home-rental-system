import { useEffect, useState } from "react";
import API from "../services/api";
import PropertyCard from "../components/PropertyCard";

export default function Properties() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  // Fetch all properties
  async function fetchProperties() {
    try {
      const res = await API.get("/properties");
      setProperties(res.data.properties);
    } catch (err) {
      console.log(err);
    }
  }

  // Delete a property
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      await API.delete(`/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Reload properties after deleting
      fetchProperties();

    } catch (err) {
      console.log(err);
      alert("Failed to delete property.");
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">

      <h1 className="text-4xl font-bold mb-8">
        Available Properties
      </h1>

      {properties.length === 0 ? (
        <p>No properties found.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

    </div>
  );
}