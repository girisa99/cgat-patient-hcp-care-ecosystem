import React from 'react';

const AccessDenied: React.FC = () => (
  <div className="p-6">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
      <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
    </div>
  </div>
);

export default AccessDenied;