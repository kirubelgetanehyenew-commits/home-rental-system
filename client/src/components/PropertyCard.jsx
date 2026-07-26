import { Link } from "react-router-dom";

export default function PropertyCard({
  property,
  onDelete,
}) {
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

        <div className="flex gap-3 mt-4">

  <Link
    to={`/property/${property._id}`}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    View Details
  </Link>

  <Link
    to={`/edit-property/${property._id}`}
    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
  >
    Edit
  </Link>

  <button
    onClick={() => onDelete(property._id)}
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
  >
    Delete
  </button>

</div>

      </div>

    </div>
  );
}