// src/hooks/useLoaderEffects.ts
import { useEffect, useState, type RefObject} from "react";
import gsap from "gsap";

interface UseLoaderEffectsProps {
  loaderRef: RefObject<HTMLDivElement | null>;
  textRef: RefObject<HTMLDivElement | null>;
}

export const useLoaderEffects = ({ loaderRef, textRef }: UseLoaderEffectsProps) => {
  const [count, setCount] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // GSAP animation to smoothly move the cursor
  // This combines the mousemove listener and the GSAP animation for textRef
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Ensure textRef.current exists before animating
    if (textRef.current) {
      gsap.to(textRef.current, {
        x: position.x,
        y: position.y,
        duration: 0.2,
        overwrite: true,
        ease: "power3.out",
      });
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [position, textRef]); // Depend on position and textRef

  // GSAP animation to fade out the loader
  useEffect(() => {
    // Ensure both refs exist before animating
    if (!loaderRef.current || !textRef.current) return;

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
      onComplete: () => {
        // Optional: Could trigger an external callback here if needed by the parent
        // For example, if the parent component needs to know when the loader is completely gone.
      }
    });

    // No cleanup needed for a static timeline
  }, [loaderRef, textRef]); // Depend on refs

  // Percentage loader
  useEffect(() => {
    if (count < 100) {
      const intervalId = setInterval(() => {
        setCount((prevCount) => prevCount + 1);
      }, 40);

      return () => clearInterval(intervalId);
    }
  }, [count]); // Depend on count

  // Cursor disappears when loading is done
  useEffect(() => {
    if (count >= 100) {
      document.body.classList.remove("loading");
    } else {
      document.body.classList.add("loading");
    }
  }, [count]); // Depend on count

  // Return the count, as the Loader component needs to display it
  return count;
};