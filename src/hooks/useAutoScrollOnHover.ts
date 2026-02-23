/**
 * useAutoScrollOnHover — Marquee-like auto-scroll on mouse hover
 * Scrolls the container left-to-right continuously while hovered.
 * Pauses on mouse leave, reverses direction at edges.
 */
import { useRef, useCallback, useEffect } from 'react';

interface UseAutoScrollOnHoverOptions {
  speed?: number; // px per frame (~60fps)
  pauseOnClick?: boolean;
}

export function useAutoScrollOnHover(options: UseAutoScrollOnHoverOptions = {}) {
  const { speed = 1.2 } = options;
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const dirRef = useRef<1 | -1>(1);
  const isHovered = useRef(false);

  const animate = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !isHovered.current) return;

    el.scrollLeft += speed * dirRef.current;

    // Bounce at edges
    if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
      dirRef.current = -1;
    } else if (el.scrollLeft <= 0) {
      dirRef.current = 1;
    }

    animRef.current = requestAnimationFrame(animate);
  }, [speed]);

  const onMouseEnter = useCallback(() => {
    isHovered.current = true;
    animRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const onMouseLeave = useCallback(() => {
    isHovered.current = false;
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return { scrollRef, onMouseEnter, onMouseLeave };
}
