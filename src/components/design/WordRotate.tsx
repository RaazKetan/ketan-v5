import React, { useEffect, useState } from "react";

export const WordRotate: React.FC<{ words: string[]; intervalMs?: number }> = ({
  words,
  intervalMs = 2400,
}) => {
  const [idx, setIdx] = useState(0);
  const [outIdx, setOutIdx] = useState<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setOutIdx((cur) => (cur === null ? idx : cur));
      setIdx((i) => (i + 1) % words.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [idx, words.length, intervalMs]);

  const widest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span className="word-rotate">
      <span className="ghost">{widest}</span>
      <span className="slot">
        {words.map((w, i) => {
          let cls = "";
          if (i === idx) cls = "is-active";
          else if (i === outIdx) cls = "is-out";
          return (
            <span key={i} className={cls}>
              {w}
            </span>
          );
        })}
      </span>
    </span>
  );
};
