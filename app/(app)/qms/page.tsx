"use client";
import React from "react";
import { useUserContext } from "@/components/layout/UserContext";
import { QmsFiles } from "@/components/deparments/PMO/qms/QmsFiles";

function Page() {
  const { user, loading } = useUserContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading user info...</p>
      </div>
    );
  }

  // Everyone can view QMS files, but only DOCUMENT CONTROLLER can upload/delete
  return <QmsFiles />;
}

export default Page;

