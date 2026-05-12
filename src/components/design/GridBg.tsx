import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export const GridBg: React.FC<{ count?: number; intervalMs?: number }> = ({
  count = 3,
  intervalMs = 1400,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    function spawnCell() {
      if (!wrap) return;
      const cell = document.createElement("div");
      cell.className = "cell";
      const r = wrap.getBoundingClientRect();
      const cols = Math.max(1, Math.floor(r.width / 56));
      const rows = Math.max(1, Math.floor(r.height / 56));
      cell.style.left = Math.floor(Math.random() * cols) * 56 + "px";
      cell.style.top = Math.floor(Math.random() * rows) * 56 + "px";
      wrap.appendChild(cell);
      gsap.fromTo(
        cell,
        { opacity: 0 },
        {
          opacity: 0.6,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(cell, {
              opacity: 0,
              duration: 1.2,
              delay: 0.4 + Math.random() * 1.4,
              onComplete: () => cell.remove(),
            });
          },
        }
      );
    }

    for (let i = 0; i < count; i++) spawnCell();
    const id = window.setInterval(() => {
      for (let i = 0; i < count; i++) spawnCell();
    }, intervalMs);
    return () => {
      window.clearInterval(id);
      if (wrap) wrap.innerHTML = "";
    };
  }, [count, intervalMs]);

  return <div className="grid-bg" ref={wrapRef} />;
};
