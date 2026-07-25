import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "tenant",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      await API.post("/auth/register", formData);

      setMessage("Registration successful!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setMessage(
        err.response?.data?.message || "Registration failed."
      );
    }

    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">

      <h1 className="text-3xl font-bold text-center mb-6">
        Register
      </h1>

      {message && (
        <div className="mb-4 p-3 rounded bg-gray-100">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        >
          <option value="tenant">Tenant</option>
          <option value="landlord">Landlord</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
        >
          {loading ? "Registering..." : "Register"}
        </button>

      </form>

    </div>
  );
}