import { Link } from "react-router-dom";

export default function PropertyCard({ property }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">

      <img
        src="https://placehold.co/600x400?text=No+Image"
        alt={property.title}
        className="w-full h-56 object-cover"
      />

      <div className="p-4">

        <h2 className="text-2xl font-bold">
          {property.title}
        </h2>

        <p className="text-gray-600 mt-2">
          📍 {property.location}
        </p>

        <p className="text-blue-600 text-xl font-bold mt-3">
          ETB {property.price}
        </p>

        <Link
          to={`/property/${property._id}`}
          className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          View Details
        </Link>

      </div>

    </div>
  );
}