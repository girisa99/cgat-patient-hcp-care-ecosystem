
import React from 'react';

interface ContentAreaProps {
  children: React.ReactNode;
  isMobile: boolean;
}

const ContentArea: React.FC<ContentAreaProps> = ({ children, isMobile }) => {
  return (
    <main className={`
      flex-1 
      min-h-[calc(100vh-4rem)]
      ${isMobile ? 'pt-12' : ''} 
      overflow-x-hidden
    `}>
      {children}
    </main>
  );
};

export default ContentArea;
