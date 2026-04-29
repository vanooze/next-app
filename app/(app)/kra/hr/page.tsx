"use client";
import React from "react";
import { useUserContext } from "@/components/layout/UserContext";
import { KeyResultAreaHRPage } from "@/components/kra/kraHRPage";

function Page() {
  const { user, loading } = useUserContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading user info...</p>
      </div>
    );
  }

  return <KeyResultAreaHRPage />;
}

export default Page;
