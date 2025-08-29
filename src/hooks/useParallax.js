import { useEffect } from 'react';

export const useParallax = (elementRef, isEnabled = true) => {
  useEffect(() => {
    if (!isEnabled || !elementRef.current) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = elementRef.current.querySelectorAll('.parallax-element');
      
      parallaxElements.forEach((element, index) => {
        const speed = (index + 1) * 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    };

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const x = (clientX / innerWidth) * 2 - 1;
      const y = (clientY / innerHeight) * 2 - 1;
      
      const floatingElements = elementRef.current.querySelectorAll('.floating-element');
      
      floatingElements.forEach((element, index) => {
        const intensity = (index + 1) * 2;
        const offsetX = x * intensity;
        const offsetY = y * intensity;
        
        element.style.transform = `translateX(${offsetX}px) translateY(${offsetY}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isEnabled, elementRef]);
};
