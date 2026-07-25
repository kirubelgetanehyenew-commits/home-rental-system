import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find Your Perfect Home
          </h1>

          <p className="text-xl mb-8">
            Browse apartments, houses, and rental properties across Ethiopia.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              to="/properties"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200"
            >
              Browse Properties
            </Link>

            <Link
              to="/register"
              className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            Search Properties
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Location"
              className="border p-3 rounded"
            />

            <input
              type="number"
              placeholder="Max Price"
              className="border p-3 rounded"
            />

            <select className="border p-3 rounded">
              <option>Bedrooms</option>
              <option>1 Bedroom</option>
              <option>2 Bedrooms</option>
              <option>3 Bedrooms</option>
              <option>4+ Bedrooms</option>
            </select>

            <button className="bg-blue-600 text-white rounded hover:bg-blue-700">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-center mb-10">
          Why Choose Us?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">Verified Listings</h3>
            <p>
              Every property is reviewed before appearing on the platform.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">Easy Search</h3>
            <p>
              Quickly find homes using location, price, and bedroom filters.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">Secure Platform</h3>
            <p>
              Protected accounts and secure property management for landlords.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}