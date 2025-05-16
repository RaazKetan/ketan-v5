import React from "react";

export const TopBar: React.FC = () => {
  return (
    <div
      className="w-screen flex flex-row justify-between p-4"
      id="navbar"
    >
      <span className="flex items-center justify-start relative w-1/3 text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 mr-2"
        >
          <path d="M12 2L2 7l10 5 10-5L12 2z" />
          <path d="M2 17l10 5 10-5V7L12 12 2 7v10z" />
        </svg>
        Open for any <br /> collaboration and offers
      </span>
      <span
        className="raaz-brand flex items-center justify-center relative w-1/3 text-center sm:text-xl md:text-2xl lg:text-4xl font-bold cursor-pointer"
        data-text="00 Home"
      >
        Raaz &copy;
      </span>
      <span className="flex justify-end relative w-1/3 text-center text-sm">
        Folio v.5
      </span>
    </div>
  );
};