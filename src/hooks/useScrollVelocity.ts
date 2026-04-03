import { useState, useEffect, useCallback, useRef } from 'react';

export const useScrollVelocity = () => {
  const [velocity, setVelocity] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const lastScrollY = useRef(0);
  const lastTimestamp = useRef(Date.now());
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const currentTimestamp = Date.now();
    const timeDiff = currentTimestamp - lastTimestamp.current;
    const scrollDiff = Math.abs(currentScrollY - lastScrollY.current);
    
    // Calculate velocity (pixels per millisecond)
    const currentVelocity = timeDiff > 0 ? scrollDiff / timeDiff : 0;
    setVelocity(currentVelocity);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      setVelocity(0);
    }, 150);

    lastScrollY.current = currentScrollY;
    lastTimestamp.current = currentTimestamp;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  return { velocity, isScrolling };
};
