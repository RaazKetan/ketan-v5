import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Home from './components/pages/home/home';
import { About } from './components/pages/about';
import { Projects } from './components/pages/projects';
import { Work } from './components/pages/work';
import { Contact } from './components/pages/contact';

gsap.registerPlugin(ScrollTrigger);

/* On every route change:
   1. Kill all ScrollTriggers from the previous page (avoid stale pins/triggers).
   2. Scroll back to top so the new page lands at the hero.
   3. Refresh ScrollTrigger after the new DOM mounts.
   Also handles browser back/forward (popstate) since React Router still fires
   a navigation event and useLocation updates. */
const RouteEffects: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    ScrollTrigger.getAll().forEach((t) => t.kill());
    window.scrollTo(0, 0);
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <RouteEffects />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/work" element={<Work />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
};

export default App;
