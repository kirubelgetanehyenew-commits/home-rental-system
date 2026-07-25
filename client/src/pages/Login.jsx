import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      const res = await API.post("/auth/login", formData);

      login(res.data.user, res.data.token);

      setMessage("Login successful!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (err) {
      setMessage(
        err.response?.data?.message || "Login failed."
      );
    }

    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">

      <h1 className="text-3xl font-bold text-center mb-6">
        Login
      </h1>

      {message && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

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
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

    </div>
  );
}