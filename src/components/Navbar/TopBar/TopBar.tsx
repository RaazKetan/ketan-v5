import React, { useState } from "react";
import { useIsMobile } from "../../../Hooks";
import { usePersonalData } from "../../../context/PersonalDataContext";

export const TopBar: React.FC = () => {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };
const {TopBarData} = usePersonalData();
  return (
    <>
      <div className="w-screen flex justify-between items-center p-4 z-50 relative" id="navbar">
        {/* Left */}
        <span className="flex items-center justify-start w-1/3 text-sm" id="collab-text">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            className="w-5 h-5 mr-2"
          >
            <path d="M12 2L2 7l10 5 10-5L12 2z" />
            <path d="M2 17l10 5 10-5V7L12 12 2 7v10z" />
          </svg>
          Open for any <br /> collaboration {!isMobile && "and offers"}
        </span>
        {!isMobile && (
          <>
         <span
        className="raaz-brand flex items-center justify-center relative w-1/3 text-center sm:text-xl md:text-2xl lg:text-4xl font-bold cursor-pointer"
        data-text="00 Home"
      >
        {TopBarData?.topBarNickname} &copy;
      </span>
      <span className="flex justify-end relative w-1/3 text-center text-sm">
        {TopBarData?.topBarFolioVersion}
      </span>
      </>
)}

        {/* Right */}
        {isMobile && 
        <span className="flex items-center justify-end w-1/3 gap-4 text-right">
          <span
            className={`raaz-brand relative sm:text-xl md:text-2xl lg:text-4xl font-bold ${
              isMobile ? "" : "cursor-pointer"
            }`}
          >
            {TopBarData?.topBarNickname} &copy;
          </span>
          
          {/* Hamburger Close Open Icon */}
            <div
              className="relative w-6 h-6 flex flex-col justify-center items-center cursor-pointer z-50"
              onClick={toggleMenu}
            >
              <div
                className={`w-6 h-0.5 bg-black transform transition duration-300 ease-in-out ${
                  menuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              />
              <div
                className={`w-6 h-0.5 bg-black mt-1 transform transition duration-300 ease-in-out ${
                  menuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              />
            </div>
        </span>
  }
      </div>
    </>
  );
};
