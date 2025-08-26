import React from "react";

export const PageTransitionOverlay: React.FC = () => {
  return (
    <div
      id="page-transition-overlay"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000",
        zIndex: 9999,
        pointerEvents: "none",
        opacity: 0,
        transform: "scaleY(0)",
        transformOrigin: "50% 50%",
      }}
    />
  );
};


