import { useEffect, useState } from "react";
import API from "../services/api";
import PropertyCard from "../components/PropertyCard";

export default function Properties() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await API.get("/properties");
        setProperties(res.data.properties);
      } catch (err) {
        console.log(err);
      }
    }

    fetchProperties();
  }, []);

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
            />
          ))}

        </div>
      )}

    </div>
  );
}