import React from 'react';

export const Info: React.FC = () => {
  return (
    <div className="flex items-center justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-screen h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Ketan Raj</h1>
        <h2>(SDE)</h2>
        <h3>@Google</h3>
      </div>
    </div>
  );
};