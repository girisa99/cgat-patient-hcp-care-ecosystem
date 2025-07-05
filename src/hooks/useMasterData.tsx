"use client";

import { useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/database.types";

/** Canonical hook – single source of truth for all master-data operations */
export function useMasterData() {
  const supabase = createClientComponentClient<Database>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Generic helper: refetch any cached queries (tRPC / SWR / React-Query) */
  const invalidateCache = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).revalidate?.(); // optional
  };

  /* -------------------------------------------------- Users */
  const createUser = useCallback(
    async (user: { firstName: string; lastName: string; email: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { error } = await supabase.from("users").insert([
          {
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            active: true,
          },
        ]);
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

  const deactivateUser = useCallback(
    async (userId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const { error } = await supabase
          .from("users")
          .update({ active: false })
          .eq("id", userId);
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
