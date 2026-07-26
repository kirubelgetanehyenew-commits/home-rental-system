import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

export default function PropertyDetails() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, []);

  async function fetchProperty() {
    try {
      const res = await API.get(`/properties/${id}`);
      setProperty(res.data.property);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center mt-20 text-xl">
        Loading...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center mt-20 text-xl">
        Property not found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">

      <img
        src="https://placehold.co/1200x500?text=Property+Image"
        alt={property.title}
        className="w-full h-96 object-cover rounded-lg shadow"
      />

      <div className="mt-8">

        <h1 className="text-4xl font-bold">
          {property.title}
        </h1>

        <p className="text-gray-500 mt-2">
          📍 {property.location}
        </p>

        <p className="text-blue-600 text-3xl font-bold mt-4">
          ETB {property.price}
        </p>

        <div className="grid grid-cols-3 gap-6 mt-8">

          <div className="bg-white shadow rounded p-4">
            <h3 className="font-bold">Bedrooms</h3>
            <p>{property.bedrooms}</p>
          </div>

          <div className="bg-white shadow rounded p-4">
            <h3 className="font-bold">Bathrooms</h3>
            <p>{property.bathrooms}</p>
          </div>

          <div className="bg-white shadow rounded p-4">
            <h3 className="font-bold">Area</h3>
            <p>{property.area} m²</p>
          </div>

        </div>

        <div className="mt-8">

          <h2 className="text-2xl font-bold mb-3">
            Description
          </h2>

          <p className="text-gray-700">
            {property.description}
          </p>

        </div>

        <div className="mt-8 bg-gray-100 rounded-lg p-6">

          <h2 className="text-2xl font-bold mb-3">
            Owner Information
          </h2>

          <p><strong>Name:</strong> {property.owner.fullName}</p>

          <p><strong>Email:</strong> {property.owner.email}</p>

          <p><strong>Phone:</strong> {property.owner.phone}</p>

        </div>

      </div>

    </div>
  );
}