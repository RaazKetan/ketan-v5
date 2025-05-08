import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Loader } from '../loader/loader';

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Animate page content after loader finishes
  useEffect(() => {
    if (!isLoading && contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
      );
    }
  }, [isLoading]);

  return (
    <>
      {isLoading && <Loader onFinish={() => setIsLoading(false)} />}
      {!isLoading && (
        <div
          ref={contentRef}
          className="p-10 text-center opacity-0" // Start hidden
        >
          <h1 className=" font-bold mb-4">Welcome to the Home Page!</h1>
          <p className="text-lg">Here’s where your main content starts.</p>
        </div>
      )}
    </>
  );
};

export default Home;
