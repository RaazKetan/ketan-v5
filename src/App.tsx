import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/pages/home/home';
import { About } from './components/pages/about';
import { PageTransitionOverlay } from './components/Transition/PageTransitionOverlay';
import { usePageTransition } from './Hooks';

// Handles the slide-up reveal on route change after the overlay filled on click
const PageTransitionEffect: React.FC = () => {
  const location = useLocation();
  const { runExitRevealIfNeeded } = usePageTransition();

  useEffect(() => {
    runExitRevealIfNeeded();
  }, [location.pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      {/* Global page transition overlay */}
      <PageTransitionOverlay />
      <PageTransitionEffect />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        {/* Add more routes here */}
      </Routes>
    </Router>
  );
};

export default App;
