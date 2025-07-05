 const createFacility = useCallback(
    async (name: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const { error } = await supabase.from("facilities").insert([{ name }]);
        if (error) throw error;
        invalidateCache();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );
"use client";

import { useMasterAuth } from "@/hooks/useMasterAuth";
import { useMasterData } from "@/hooks/useMasterData";
import AccessDenied from "@/components/AccessDenied";

export default function Facilities() {
  const { user, role } = useMasterAuth();
  const { createFacility, isLoading, error } = useMasterData();

  if (role !== "superAdmin") return <AccessDenied />;

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Facilities</h1>
      <button
        onClick={() => createFacility(`Facility ${Date.now()}`)}
        disabled={isLoading}
        className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {isLoading ? "Adding…" : "Add Sample Facility"}
      </button>
      {error && <p className="mt-4 text-destructive">{error}</p>}
    </main>
  );
}
