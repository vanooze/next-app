"use client";
import React from "react";
import { useUserContext } from "@/components/layout/UserContext";
import { StockItems } from "@/components/deparments/INVENTORY/stockItems/StockItems";

function Page() {
  const { user, loading } = useUserContext();
  const SUPERADMIN = user?.restriction.includes("9");
  const allowed = ["PURCHASING", "ACCOUNTING&INVENTORY"];
  const hasAccess = (user && allowed.includes(user.department)) || SUPERADMIN;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading user info...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600 font-semibold text-lg">
          🚫 You don’t have access to this page.
        </p>
      </div>
    );
  }

  return <StockItems />;
}

export default Page;
