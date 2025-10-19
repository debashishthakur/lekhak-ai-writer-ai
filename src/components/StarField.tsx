import { useEffect, useRef, useState, memo } from "react";

const StarField = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Star configuration - reduce count on mobile for better performance
    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 100 : 200;
    
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      twinkleSpeed: number;
    }> = [];

    // Create stars
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    // Animation with frame throttling for better performance
    let animationFrameId: number;
    let lastFrameTime = 0;
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;
    
    // Visibility API to pause animation when tab is not visible
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const animate = (currentTime: number) => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      
      if (currentTime - lastFrameTime >= frameInterval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        stars.forEach((star) => {
          // Twinkle effect
          star.opacity += star.twinkleSpeed;
          if (star.opacity >= 1 || star.opacity <= 0) {
            star.twinkleSpeed *= -1;
          }

          // Slow drift
          star.y += star.speed;
          if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
          }

          // Draw star
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 180, 255, ${star.opacity})`;
          ctx.fill();

          // Add glow for larger stars (only on desktop for performance)
          if (!isMobile && star.size > 1.2) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(
              star.x,
              star.y,
              0,
              star.x,
              star.y,
              star.size * 2
            );
            gradient.addColorStop(0, `rgba(180, 140, 255, ${star.opacity * 0.3})`);
            gradient.addColorStop(1, "rgba(180, 140, 255, 0)");
            ctx.fillStyle = gradient;
            ctx.fill();
          }
        });
        
        lastFrameTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
});

StarField.displayName = 'StarField';

export default StarField;
