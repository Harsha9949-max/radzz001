import React, { useRef, useEffect, useMemo } from 'react';

// Generate particles outside the component so it's not recalculated on every render
const generateParticles = (numParticles: number) => {
  return Array.from({ length: numParticles }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: `${Math.random() * 200 - 100}vw`,
    top: `${Math.random() * 200 - 100}vh`,
    depth: `${Math.random() * 800 - 400}px`,
    delay: `${Math.random() * -20}s`,
    duration: `${Math.random() * 10 + 15}s`,
  }));
};


const Stylized3DScene: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const particles = useMemo(() => generateParticles(50), []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (sceneRef.current) {
        const { clientX, clientY } = event;
        const { innerWidth, innerHeight } = window;
        const rotateX = (clientY / innerHeight - 0.5) * -15; // Max 7.5deg tilt
        const rotateY = (clientX / innerWidth - 0.5) * 15;   // Max 7.5deg tilt

        sceneRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="scene-container" aria-hidden="true">
      <div className="scene" ref={sceneRef}>
        {/* Background Grid */}
        <div className="grid-layer"></div>
      
        {/* Main Spheres */}
        <div className="sphere main-sphere"></div>
        <div
          className="sphere orbiting-sphere"
          style={{ transform: 'rotateY(70deg) translateX(40vmin) rotateY(-70deg)', animationDelay: '0s' }}
        ></div>
        <div
          className="sphere orbiting-sphere"
          style={{ transform: 'rotateY(190deg) translateX(35vmin) rotateY(-190deg) scale(0.8)', animationDelay: '-2s' }}
        ></div>
        <div
          className="sphere orbiting-sphere"
          style={{ transform: 'rotateY(310deg) translateX(45vmin) rotateY(-310deg) scale(1.2)', animationDelay: '-4s' }}
        ></div>
        
        {/* Particles */}
        {particles.map(p => (
            <div
                key={p.id}
                className="particle"
                style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    left: p.left,
                    top: p.top,
                    transform: `translateZ(${p.depth})`,
                    animationDelay: p.delay,
                    animationDuration: p.duration,
                }}
            ></div>
        ))}
      </div>
    </div>
  );
};

export default Stylized3DScene;