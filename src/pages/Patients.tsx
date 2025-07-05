const createPatient = useCallback(
    async (data: { firstName: string; lastName: string; dob: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { error } = await supabase.from("patients").insert([
          {
            first_name: data.firstName,
            last_name: data.lastName,
            dob: data.dob,
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

  return {
    /* users */
    createUser,
    deactivateUser,
    /* facilities */
    createFacility,
    /* patients */
    createPatient,
    /* meta */
    isLoading,
    error,
  };
}