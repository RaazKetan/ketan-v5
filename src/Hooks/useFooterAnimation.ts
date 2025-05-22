// src/hooks/useFooterAnimation.ts
import { useEffect, useCallback, type RefObject } from "react";
import gsap from "gsap";

interface UseFooterAnimationProps {
  contentRef: RefObject<HTMLDivElement | null>;
  leftSpanRef: RefObject<HTMLSpanElement | null>;
  rightSpanRef: RefObject<HTMLSpanElement | null>;
  imageRef: RefObject<HTMLDivElement | null>;
  onAnimationComplete?: () => void;
}

export const useFooterAnimation = ({
  contentRef,
  leftSpanRef,
  rightSpanRef,
  imageRef,
  onAnimationComplete,
}: UseFooterAnimationProps) => {
  const handleAnimationComplete = useCallback(() => {
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  }, [onAnimationComplete]); // It's crucial to include onAnimationComplete in dependencies here

  useEffect(() => {
    const leftSpan = leftSpanRef.current;
    const rightSpan = rightSpanRef.current;
    const container = contentRef.current;
    const imageContainer = imageRef.current;

    if (container && leftSpan && rightSpan && imageContainer) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const smallScreenWidth = 768;

      // Initial setup - hide image
      gsap.set(imageContainer, {
        opacity: 0,
        scale: 1,
        y: 0
      });

      gsap.fromTo(
        container,
        {
          opacity: 0,
          y: 10,
          position: "absolute",
          top: viewportHeight / 2,
          left: viewportWidth / 2,
          transform: "translate(-50%, -50%)",
        },
        {
          opacity: 1,
          y: 0,
          top: viewportHeight / 2,
          left: viewportWidth / 2,
          transform: "translate(-50%, -50%)",
          duration: 2,
          ease: "power2.out",
          delay: 1,
          onComplete: () => {
            const tl = gsap.timeline({ onComplete: handleAnimationComplete });
            const leftSpanWidth = leftSpan.offsetWidth || 0;
            const rightSpanWidth = rightSpan.offsetWidth || 0;
            const leftSpanHeight = leftSpan.offsetHeight || 0;
            const rightSpanHeight = rightSpan.offsetHeight || 0;

            if (viewportWidth > smallScreenWidth) {
              tl.to([leftSpan, rightSpan], {
              x: (index) =>
                index === 0
                ? -(viewportWidth / 2.4 - leftSpanWidth / 2.4)
                : viewportWidth / 2.6 - rightSpanWidth / 2.6,
              duration: 1.5,
              ease: "power4.inOut",
              }, 0); // Overlap starts immediately

              tl.to(imageContainer, {
                opacity: 1,
                scale: 1,
                y: 0,
                delay: 0.3,
                duration: 1,
                ease: "expo.out",
                }, 0.25); // Overlap starts immediately

            }


            // For small screens, show SVG at the beginning
            if (viewportWidth <= smallScreenWidth) {
              gsap.set(imageContainer, {
                opacity: 1,
                scale: 1,
                y: 0,
                delay:4,
              });
              gsap.to(imageContainer, {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 2,
              ease: "power4.out",
              onComplete: () => {
                gsap.to(imageContainer, {
                  opacity: 1,
                  scale: 1,
                  y:viewportHeight / 2.1 - 120,
                  duration: 2,
                  ease: "power4.out",
                });
              }
            });
            }

            // move text apart for big screens
            tl.to([leftSpan, rightSpan], {
              y: (index: number) =>
                index === 0
                  ? viewportHeight / 2.1 - leftSpanHeight
                  : viewportHeight / 2.1 - rightSpanHeight,
              duration: 2,
              delay: viewportWidth <= smallScreenWidth ? 0 : 1.5,
              ease: "power4.out",
            },);

            // SVG appears in the middle when text is apart
            if(viewportWidth > smallScreenWidth) {
            tl.to(imageContainer, {
              opacity: 1,
              scale: 1,
              y:viewportHeight / 2.1 - 120,
              duration: 1.8,
              ease: "power4.out",
            }, viewportWidth > smallScreenWidth ? "-=2" : "-=2");
          }

            tl.to([leftSpan, rightSpan], {
              x: 0,
              duration: 1.5,
              ease: "power4.inOut",
            });


          },
        }
      );
    }
  }, [contentRef, leftSpanRef, rightSpanRef, imageRef]); 
};