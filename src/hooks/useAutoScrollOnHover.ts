/**
 * useAutoScrollOnHover — Continuous marquee auto-scroll
 * Scrolls left-to-right continuously. PAUSES on mouse hover so users can click.
 * Resumes when mouse leaves.
 */
import { useRef, useCallback, useEffect } from 'react';

interface UseAutoScrollOptions {
  speed?: number; // px per frame (~60fps)
}

export function useAutoScrollOnHover(options: UseAutoScrollOptions = {}) {
  const { speed = 1.0 } = options;
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const dirRef = useRef<1 | -1>(1);
  const isPaused = useRef(false);

  const animate = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isPaused.current) {
      animRef.current = requestAnimationFrame(animate);
      return;
    }

    el.scrollLeft += speed * dirRef.current;

    // Bounce at edges
    if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
      dirRef.current = -1;
    } else if (el.scrollLeft <= 0) {
      dirRef.current = 1;
    }

    animRef.current = requestAnimationFrame(animate);
  }, [speed]);

  // Start scrolling on mount
  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [animate]);

  // Pause on hover, resume on leave
  const onMouseEnter = useCallback(() => {
    isPaused.current = true;
  }, []);

  const onMouseLeave = useCallback(() => {
    isPaused.current = false;
  }, []);

  return { scrollRef, onMouseEnter, onMouseLeave };
}
