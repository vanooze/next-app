"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [contract, setContract] = useState<any>(null); // Replace `any` with proper type if known
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const token = params.token as string | undefined;

  useEffect(() => {
    if (!token) return;

    const fetchContractDetails = async () => {
      try {
        const res = await fetch(
          `/api/department/PMO/project_tasks/projectkickoff/bidding/validate?token=${token}`
        );
        const data = await res.json();
        console.log("VALIDATION DATA", data);

        if (!res.ok) {
          setMessage(data.error || "Invalid or expired token.");
          setLoading(false);
          return;
        }

        setContract(data[0]);
        setLoading(false);
      } catch (err) {
        setMessage("Failed to validate link.");
        setLoading(false);
      }
    };

    fetchContractDetails();
  }, [token]);

  const handleUpload = async () => {
    if (!file) return setMessage("Please select a file.");
    if (!token) return setMessage("Invalid token.");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      `/api/department/PMO/project_tasks/projectkickoff/bidding/upload?token=${token}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    if (res.ok) {
      setMessage("File uploaded successfully.");
    } else {
      setMessage(data.error || "Upload failed.");
    }
  };

  if (loading) {
    return <p className="text-center p-4">Validating link...</p>;
  }

  if (!contract) {
    return <p className="text-center p-4 text-red-600">{message}</p>;
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-center">
        Upload for Project: {contract.projectName || "Unknown"}
      </h2>

      <p className="text-sm text-gray-600 text-center">
        Bidding Window: {contract.startDate} – {contract.endDate}
      </p>

      {/* ✅ Show status message if expired or closed */}
      {["Close", "Expired"].includes(contract.status) ? (
        <p className="text-center text-red-600 font-medium">
          This upload link is either closed or expired. Uploads are not allowed.
        </p>
      ) : (
        <>
          {contract.attachmentName && (
            <p className="text-sm text-green-600 text-center">
              Current File: {contract.attachmentName}
            </p>
          )}

          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full"
          />
          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Upload
          </button>
        </>
      )}

      {message && <p className="text-sm text-center">{message}</p>}
    </div>
  );
}

export default Upload;
