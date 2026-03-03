"use client";
import React from "react";
import { useUserContext } from "@/components/layout/UserContext";
import { KeyResultAreaPage } from "@/components/kra/kraMainPage";

function Page() {
  const { user, loading } = useUserContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading user info...</p>
      </div>
    );
  }

  return <KeyResultAreaPage />;
}

export default Page;
