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
   1. Scroll back to top so the new page lands at the hero.
   2. Refresh ScrollTrigger once the new DOM has settled so the new page's
      triggers re-measure against the new layout.
   We do NOT kill ScrollTriggers here — each page's useEffect cleanup runs
   ctx.revert() on unmount, which handles its own teardown. Killing here
   would race with the new page's mount and wipe its just-created triggers,
   leaving from-state elements hidden. */
const RouteEffects: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
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
