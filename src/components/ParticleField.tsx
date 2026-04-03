import { useEffect, useRef } from 'react';

interface ParticleFieldProps {
  scrollVelocity?: number;
  isScrolling?: boolean;
  activeFrame?: number;
}

const ParticleField = ({ scrollVelocity = 0, isScrolling = false, activeFrame = 0 }: ParticleFieldProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particleCount = 25;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random positioning
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      
      // Random animation delay
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (8 + Math.random() * 4) + 's';
      
      container.appendChild(particle);
      particlesRef.current.push(particle);
    }

    return () => {
      container.innerHTML = '';
      particlesRef.current = [];
    };
  }, []);

  // React to scroll velocity
  useEffect(() => {
    particlesRef.current.forEach((particle, index) => {
      if (isScrolling && scrollVelocity > 0.1) {
        // Speed up particles during fast scroll
        const speedMultiplier = Math.min(scrollVelocity * 2, 3);
        particle.style.animationDuration = `${(8 - index * 0.1) / speedMultiplier}s`;
        
        // Add glow effect during scroll
        particle.style.boxShadow = `0 0 ${scrollVelocity * 20}px hsl(var(--primary))`;
      } else {
        // Reset to normal
        particle.style.animationDuration = `${8 + index * 0.2}s`;
        particle.style.boxShadow = 'none';
      }
    });
  }, [scrollVelocity, isScrolling]);

  // React to frame changes
  useEffect(() => {
    particlesRef.current.forEach((particle, index) => {
      const intensity = activeFrame / 11; // 0 to 1
      particle.style.opacity = `${0.1 + (intensity * 0.4)}`;
      
      // Change color based on frame
      if (activeFrame >= 6 && activeFrame <= 8) {
        // Red tint frames
        particle.style.background = 'hsl(var(--eden-crimson))';
      } else {
        particle.style.background = 'hsl(var(--primary))';
      }
    });
  }, [activeFrame]);

  return <div ref={containerRef} className="particle-field" />;
};

export default ParticleField;
