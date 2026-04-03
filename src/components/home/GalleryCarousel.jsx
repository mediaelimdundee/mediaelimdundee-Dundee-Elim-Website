import { useRef, useEffect } from 'react';

export default function GalleryCarousel({ images }) {
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const velRef = useRef(0);
  const speedRef = useRef(-0.5); // negative = scroll left

  // Repeat images enough times to always fill the screen
  const items = [...images, ...images, ...images, ...images];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf;

    const getSetWidth = () => {
      const children = track.children;
      if (!children.length) return 0;
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.gap) || 16;
      return (children[0].offsetWidth + gap) * images.length;
    };

    const clamp = () => {
      const setW = getSetWidth();
      if (setW === 0) return;
      // Keep position within [-setW*2, 0] range by wrapping
      while (posRef.current > 0) posRef.current -= setW;
      while (posRef.current < -setW * 2) posRef.current += setW;
    };

    const loop = () => {
      if (!isDragging.current) {
        posRef.current += speedRef.current;
      }
      clamp();
      track.style.transform = `translateX(${posRef.current}px)`;
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [images.length]);

  const startDrag = (x) => {
    isDragging.current = true;
    lastX.current = x;
    velRef.current = 0;
  };

  const moveDrag = (x) => {
    if (!isDragging.current) return;
    const dx = x - lastX.current;
    lastX.current = x;
    velRef.current = dx;
    posRef.current += dx;
  };

  const endDrag = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    // Carry momentum then settle back to default scroll
    const v = velRef.current;
    speedRef.current = v !== 0 ? v * 0.15 : -0.5;
    // Gradually ease back to -0.5
    const decay = setInterval(() => {
      if (!isDragging.current) {
        if (speedRef.current > -0.5) speedRef.current = Math.max(-0.5, speedRef.current - 0.02);
        else if (speedRef.current < -0.5) speedRef.current = Math.min(-0.5, speedRef.current + 0.02);
        else clearInterval(decay);
      } else {
        clearInterval(decay);
      }
    }, 16);
  };

  return (
    <div className="relative w-full overflow-hidden select-none cursor-grab active:cursor-grabbing">
      {/* Fade left */}
      <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #0d2050, transparent)' }} />
      {/* Fade right */}
      <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #0d2050, transparent)' }} />

      <div
        ref={trackRef}
        className="flex will-change-transform"
        style={{ gap: '16px', width: 'max-content' }}
        onMouseDown={e => { startDrag(e.clientX); e.preventDefault(); }}
        onMouseMove={e => moveDrag(e.clientX)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={e => startDrag(e.touches[0].clientX)}
        onTouchMove={e => { moveDrag(e.touches[0].clientX); }}
        onTouchEnd={endDrag}
      >
        {items.map((src, i) => (
          <div key={i} className="shrink-0 w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden">
            <img
              src={src}
              alt="Life at Dundee Elim"
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}