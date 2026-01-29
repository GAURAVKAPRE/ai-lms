// pages/Auth.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Clear form on page load (after logout)
  useEffect(() => {
    setFormData({ name: "", email: "", password: "" });
    setMessage("");
  }, []);

  // Clear form when switching Login/Register
  useEffect(() => {
    setFormData({ name: "", email: "", password: "" });
    setMessage("");
  }, [isRegister]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const url = isRegister
      ? "http://localhost:5000/api/auth/register"
      : "http://localhost:5000/api/auth/login";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Something went wrong");
        return;
      }

      // ✅ Store token separately
      localStorage.setItem("token", data.token);

      // ✅ Store user without token
      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          instructorProfile: data.instructorProfile || { enabled: false },
        })
      );

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setMessage("Backend not running");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>

        {message && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="username"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isRegister
              ? "Register"
              : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            onClick={() => setIsRegister(!isRegister)}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
