
"use client";

import React from "react";
import { useMasterAuth } from "@/hooks/useMasterAuth";
import { useMasterData } from "@/hooks/useMasterData";
import AccessDenied from "@/components/AccessDenied";

export default function Facilities() {
  const { userRoles } = useMasterAuth();
  const { createFacility, isLoading, error } = useMasterData();

  const isSuperAdmin = userRoles.includes('superAdmin');

  if (!isSuperAdmin) return <AccessDenied />;

  const handleCreateFacility = () => {
    createFacility({
      name: `Facility ${Date.now()}`,
      address: "Sample Address",
      phone: "555-0123"
    });
  };

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Facilities</h1>
      <button
        onClick={handleCreateFacility}
        disabled={isLoading}
        className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {isLoading ? "Adding…" : "Add Sample Facility"}
      </button>
      {error && <p className="mt-4 text-destructive">{error}</p>}
    </main>
  );
}
