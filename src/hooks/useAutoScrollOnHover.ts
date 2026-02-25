/**
 * useAutoScrollOnHover — Continuous marquee auto-scroll
 * Direction is region-aware: LTR regions scroll left→right, RTL regions scroll right→left.
 * PAUSES on mouse hover so users can click. Resumes when mouse leaves.
 */
import { useRef, useCallback, useEffect } from 'react';

interface UseAutoScrollOptions {
  speed?: number; // px per frame (~60fps)
  /** 'ltr' = content flows left-to-right (default for US/Europe), 'rtl' = right-to-left (Arabic, Hebrew) */
  direction?: 'ltr' | 'rtl';
}

export function useAutoScrollOnHover(options: UseAutoScrollOptions = {}) {
  const { speed = 1.0, direction = 'ltr' } = options;
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const isPaused = useRef(false);
  // For LTR: start at left (scrollLeft=0), move rightward (+1), bounce back
  // For RTL: start at right (scrollLeft=max), move leftward (-1), bounce back
  const dirRef = useRef<1 | -1>(direction === 'ltr' ? 1 : -1);
  const initialized = useRef(false);

  const animate = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isPaused.current) {
      animRef.current = requestAnimationFrame(animate);
      return;
    }

    // On first frame for RTL, jump to the end so we scroll leftward
    if (!initialized.current) {
      initialized.current = true;
      if (direction === 'rtl') {
        el.scrollLeft = el.scrollWidth - el.clientWidth;
      }
    }

    el.scrollLeft += speed * dirRef.current;

    // Bounce at edges
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (el.scrollLeft >= maxScroll - 1) {
      dirRef.current = -1;
    } else if (el.scrollLeft <= 0) {
      dirRef.current = 1;
    }

    animRef.current = requestAnimationFrame(animate);
  }, [speed, direction]);

  // Start scrolling on mount
  useEffect(() => {
    initialized.current = false;
    dirRef.current = direction === 'ltr' ? 1 : -1;
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [animate, direction]);

  // Pause on hover, resume on leave
  const onMouseEnter = useCallback(() => {
    isPaused.current = true;
  }, []);

  const onMouseLeave = useCallback(() => {
    isPaused.current = false;
  }, []);

  return { scrollRef, onMouseEnter, onMouseLeave };
}
