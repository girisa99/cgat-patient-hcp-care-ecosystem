
import React from 'react';

interface ErrorStateProps {
  title: string;
  error: { message: string };
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title, error }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground text-red-600">
            Error loading records: {error.message}
          </p>
        </div>
      </div>
    </div>
  );
};
