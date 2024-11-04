import React, { useEffect, useRef } from 'react';

const BlackHoleVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set fixed size for the visualization
    canvas.width = 300;  // Smaller fixed width
    canvas.height = 300; // Smaller fixed height

    let hue = 240; // Start with blue
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      angle: number;
      distance: number;
      speed: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 50; i++) { // Reduced number of particles
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: Math.random() * 1.5 + 0.5, // Smaller particles
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * 50 + 30, // Smaller ring radius
        speed: Math.random() * 0.03 + 0.02 // Slightly faster
      });
    }

    const animate = () => {
      // Create gradient background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.angle += particle.speed;
        particle.x = canvas.width / 2 + Math.cos(particle.angle) * particle.distance;
        particle.y = canvas.height / 2 + Math.sin(particle.angle) * particle.distance;

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius
        );
        gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 1)`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      hue = (hue + 0.5) % 360;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="mx-auto rounded-lg"
      style={{ background: 'black' }}
    />
  );
};

export default BlackHoleVisualization; 