import React from "react";

/** Reusable message shown when the current user lacks permission. */
export default function AccessDenied() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-10 text-center">
      <h1 className="text-2xl font-semibold text-destructive">Access Denied</h1>
      <p className="max-w-md text-muted-foreground">
        You don’t have permission to view this page.<br />
        Please contact an administrator if you believe this is a mistake.
      </p>
    </div>
  );
}