import { useEffect, useRef } from 'react';

export default function Confetti() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const colors = ['#E91E8C', '#2196F3', '#FF9800', '#009688', '#9C27B0', '#FFEB3B', '#4CAF50'];
    const pieces: HTMLDivElement[] = [];

    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      const size = Math.random() * 8 + 6;
      piece.style.cssText = `
        position: fixed;
        top: ${Math.random() * 30}%;
        left: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation: confettiFall ${0.8 + Math.random() * 1.5}s ease-in ${Math.random() * 0.8}s forwards;
        pointer-events: none;
        z-index: 9999;
      `;
      container.appendChild(piece);
      pieces.push(piece);
    }

    return () => pieces.forEach(p => p.remove());
  }, []);

  return <div ref={containerRef} className="pointer-events-none" />;
}
