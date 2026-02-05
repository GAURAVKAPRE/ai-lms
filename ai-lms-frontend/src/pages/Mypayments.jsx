import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyPayments = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/payments/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load payments");
        return;
      }

      setPayments(data);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) return <div className="text-center mt-20">Loading payments...</div>;
  if (error) return <div className="text-red-600 text-center mt-20">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-indigo-600 mb-4"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6">My Payments</h1>

      {payments.length === 0 ? (
        <p className="text-gray-600">No payments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Course</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Payment ID</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-3">
                    {p.courseId?.title || "Course"}
                  </td>
                  <td className="p-3">
                    ₹{p.amount}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        p.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {p.razorpayPaymentId || "-"}
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyPayments;
