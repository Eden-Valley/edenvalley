import { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorTrailRef = useRef<HTMLDivElement>(null);
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'text' | 'button'>('default');
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarse) return;

    // Apply cursor: none globally
    const style = document.createElement('style');
    style.innerHTML = `
      * { cursor: none !important; }
      body { cursor: none !important; }
      a, button, [role="button"], input, textarea, .cursor-pointer { cursor: none !important; }
    `;
    document.head.appendChild(style);

    const mousePos = { x: 0, y: 0 };
    const trailPos = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`;
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, .cursor-pointer')) {
        setCursorType('pointer');
      } else if (target.closest('button, [role="button"]')) {
        setCursorType('button');
      } else if (target.closest('input, textarea')) {
        setCursorType('text');
      } else {
        setCursorType('default');
      }
    };

    const onMouseDown = () => setIsMouseDown(true);
    const onMouseUp = () => setIsMouseDown(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    let rafId: number;
    const updateTrail = () => {
      // Linear interpolation for the trailing effect (0.1s delay simulated by low easing)
      const ease = 0.15;
      trailPos.x += (mousePos.x - trailPos.x) * ease;
      trailPos.y += (mousePos.y - trailPos.y) * ease;

      if (cursorTrailRef.current) {
        cursorTrailRef.current.style.transform = `translate3d(${trailPos.x}px, ${trailPos.y}px, 0)`;
      }
      rafId = requestAnimationFrame(updateTrail);
    };
    rafId = requestAnimationFrame(updateTrail);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(rafId);
      document.head.removeChild(style);
    };
  }, []);

  const getCursorStyles = () => {
    const isPointer = cursorType === 'pointer';
    const isButton = cursorType === 'button';
    const isText = cursorType === 'text';

    return {
      dot: {
        width: isText ? '2px' : '6px',
        height: isText ? '20px' : '6px',
        backgroundColor: '#34C759',
        borderRadius: isText ? '1px' : '50%',
        scale: isMouseDown ? 0.8 : 1,
        transition: 'width 0.3s cubic-bezier(0.23, 1, 0.32, 1), height 0.3s cubic-bezier(0.23, 1, 0.32, 1), border-radius 0.3s, scale 0.2s',
      },
      trail: {
        width: isPointer ? '40px' : isButton ? '35px' : '24px',
        height: isPointer ? '40px' : isButton ? '35px' : '24px',
        border: `1.5px solid ${isText ? 'transparent' : 'rgba(255, 255, 255, 0.4)'}`,
        backgroundColor: isPointer ? 'rgba(52, 199, 89, 0.1)' : 'transparent',
        scale: isMouseDown ? 0.9 : 1,
        opacity: isText ? 0 : 1,
        transition: 'width 0.4s cubic-bezier(0.23, 1, 0.32, 1), height 0.4s cubic-bezier(0.23, 1, 0.32, 1), background-color 0.4s, opacity 0.3s, scale 0.2s',
      }
    };
  };

  const styles = getCursorStyles();

  return (
    <>
      {/* Small center dot or I-beam */}
      <div 
        ref={cursorDotRef}
        className="fixed top-0 left-0 pointer-events-none z-[10000] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={styles.dot}
      />
      
      {/* Outer trail ring */}
      <div 
        ref={cursorTrailRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={styles.trail}
      />
    </>
  );
};

export default CustomCursor;
