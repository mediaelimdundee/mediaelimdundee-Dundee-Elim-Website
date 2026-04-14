import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import LiquidGlassBackground from './LiquidGlassBackground';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function Layout() {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-transparent">
      <LiquidGlassBackground />
      <ScrollToTop />
      <Navbar />
      <main className="relative">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
