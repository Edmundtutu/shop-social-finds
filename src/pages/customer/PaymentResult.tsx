// src/pages/PaymentResult.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function PaymentResult() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [txRef, setTxRef] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tx_ref = params.get("tx_ref");
    const status = params.get("status");
    const msg = params.get("message");

    setStatus(status);
    setTxRef(tx_ref);
    setMessage(msg || null);

    setLoading(false);
  }, []);

  const handleBack = () => {
    navigate("/profile");
  };

  if (loading) return <div className="text-center mt-20">Verifying payment...</div>;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {status === "success" && (
        <div className="text-center">
          <h1 className="text-green-600 text-3xl font-bold">Payment Successful 🎉</h1>
          <p className="text-gray-500 mt-3">Your order has been confirmed.</p>
        </div>
      )}

      {status === "failed" && (
        <div className="text-center">
          <h1 className="text-red-600 text-3xl font-bold">Payment Failed ❌</h1>
          <p className="text-gray-500 mt-3">We couldn’t process your payment.</p>
        </div>
      )}

      {status === "cancelled" && (
        <div className="text-center">
          <h1 className="text-yellow-600 text-3xl font-bold">Payment Cancelled ⚠️</h1>
          <p className="text-gray-500 mt-3">You cancelled this transaction.</p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center">
          <h1 className="text-red-600 text-3xl font-bold">Error ⚠️</h1>
          <p className="text-gray-500 mt-3">{message || "Something went wrong."}</p>
        </div>
      )}

      <button
        className="mt-8 bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700"
        onClick={handleBack}
      >
        Back to App
      </button>
    </div>
  );
}
