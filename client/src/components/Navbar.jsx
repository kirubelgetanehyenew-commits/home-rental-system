import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-2xl font-bold">
          Home Rental
        </Link>

        <div className="flex gap-6">
          <Link to="/">Home</Link>
          <Link to="/properties">Properties</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </div>
    </nav>
  );
}