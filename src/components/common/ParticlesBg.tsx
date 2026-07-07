import React, { useEffect, useRef } from 'react';

const ParticlesBg: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
    }> = [];

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 12 : 35; // minimal impact on performance

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1.5,
          vx: (Math.random() - 0.5) * 0.15, // extremely slow side drift
          vy: Math.random() * 0.2 + 0.1,    // slow float down
          alpha: Math.random() * 0.12 + 0.04, // very soft visibility
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        // Using a soft crimson/red glow for the healthcare aesthetic
        ctx.fillStyle = `rgba(239, 68, 68, ${p.alpha})`; 
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.y > canvas.height) {
          p.y = 0;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    resizeCanvas();
    createParticles();
    drawParticles();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
};

export default ParticlesBg;
