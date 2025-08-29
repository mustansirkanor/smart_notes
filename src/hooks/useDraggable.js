import { useState, useEffect, useRef } from 'react';

export const useDraggable = (initialPosition = { x: 0 }) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0 });
  const elementRef = useRef(null);

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (e.button === 0) { // Left click only
        e.preventDefault();
        const rect = elementRef.current.getBoundingClientRect();
        setDragOffset({
          x: e.clientX - rect.left
        });
        setIsDragging(true);
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      e.preventDefault();
      const newX = e.clientX - dragOffset.x;
      
      // ✅ HORIZONTAL ONLY: Only allow left-right movement
      const chatbotWidth = elementRef.current?.offsetWidth || 380;
      const maxX = window.innerWidth - chatbotWidth;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX))
        // No Y position - it stays fixed at bottom
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const element = elementRef.current;
    if (element) {
      element.addEventListener('mousedown', handleMouseDown);
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (element) {
        element.removeEventListener('mousedown', handleMouseDown);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // ✅ Function to keep chatbot within horizontal bounds
  const adjustToViewport = (currentX) => {
    const chatbotWidth = elementRef.current?.offsetWidth || 380;
    const maxX = window.innerWidth - chatbotWidth;
    return {
      x: Math.max(0, Math.min(currentX, maxX))
    };
  };

  return {
    position,
    isDragging,
    elementRef,
    setPosition,
    adjustToViewport
  };
};
