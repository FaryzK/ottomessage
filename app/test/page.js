"use client";

import { useState } from "react";

export default function TestPage() {
  const [status, setStatus] = useState("Not Initialized");
  const [error, setError] = useState("");

  const initializeClient = async () => {
    try {
      const response = await fetch("/api/whatsapp/test");
      const data = await response.json();
      if (response.ok) {
        setStatus(data.message);
        setError("");
      } else {
        setStatus("Failed to initialize");
        setError(data.error || "Unknown error");
      }
    } catch (err) {
      setStatus("Error");
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">WhatsApp Client Test</h1>
      <button
        onClick={initializeClient}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
      >
        Initialize WhatsApp Client
      </button>
      <div className="mt-4">
        <p>
          Status: <span className="font-semibold">{status}</span>
        </p>
        {error && <p className="text-red-500 mt-2">Error: {error}</p>}
      </div>
    </main>
  );
}
