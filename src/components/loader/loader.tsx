import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export const Loader = () => {
  const loaderRef = useRef(null);
  const textRef = useRef(null);
  const [count, setCount] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // GSAP animation to smoothly move the cursor
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    gsap.to(textRef.current, {
      x: position.x,
      y: position.y,
      duration: 0.2,
      overwrite: true,
      ease: "power3.out",
    });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [position]);

  // GSAP animation to fade out the loader
  useEffect(() => {
    const tl = gsap.timeline({});

    tl.fromTo(
      textRef.current,
      { y: 100 },
      { y: 0, opacity: 1, duration: 1, ease: "power4.out" }
    ).to(loaderRef.current, {
      y: -20,
      duration: 1.5,
      ease: "power2.inOut",
      delay: 3,
      opacity: 0,
    });
  }, []);
  
  //percentage loader
  useEffect(() => {
    if (count < 100) {
      const intervalId = setInterval(() => {
        setCount((prevCount) => prevCount + 1);
      }, 40);

      return () => clearInterval(intervalId);
    }
  }, [count]);

  // cursor disappears when loading is done
  useEffect(() => {
    if (count >= 100) {
      document.body.classList.remove("loading");
    } else {
      document.body.classList.add("loading");
    }
  }, [count]);
  return (
    <div ref={loaderRef} className="fixed top-0 left-0 z-10 text-center">
      {/* Your other content goes here */}{" "}
      <div
        className="fixed top-0 left-0 pointer-events-none text-sm translate-x-[-50%] translate-y-[-50%] text-[#333]"
        ref={textRef}
      >
        Loading {count}%
      </div>{" "}
    </div>
  );
};
