// pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 px-4">
      <div className="max-w-xl text-center bg-white p-10 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Welcome to <span className="text-indigo-600">AI LMS</span>
        </h1>

        <p className="text-gray-600 mb-8 text-lg">
          Learn smarter. Teach better.  
          Join our AI-powered learning platform.
        </p>

        <Link
          to="/auth"
          className="inline-block px-8 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition"
        >
          Login / Register
        </Link>
      </div>
    </div>
  );
};

export default Home;
