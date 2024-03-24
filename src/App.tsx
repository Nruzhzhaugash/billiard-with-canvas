import React, { useRef, useEffect, useState } from 'react';
import ColorPicker from './selectColor';

interface Ball {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
}

const BilliardsTable: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [selectedBall, setSelectedBall] = useState<Ball | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isColorPickerVisible, setIsColorPickerVisible] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouseDown = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      for (const ball of balls) {
        const dx = ball.x - mouseX;
        const dy = ball.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball.radius) {
          setSelectedBall(ball);
          setIsColorPickerVisible(true); 
          setIsDragging(true);
          setMousePosition({ x: mouseX, y: mouseY });
          break;
        }
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !selectedBall) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const dx = mouseX - mousePosition.x;
      const dy = mouseY - mousePosition.y;

      selectedBall.x += dx;
      selectedBall.y += dy;

      setMousePosition({ x: mouseX, y: mouseY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (selectedBall) {
        selectedBall.velocity.x = (mousePosition.x - selectedBall.x) * 0.1;
        selectedBall.velocity.y = (mousePosition.y - selectedBall.y) * 0.1;
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [balls, isDragging, mousePosition, selectedBall]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const ball of balls) {
        for (const otherBall of balls) {
          if (ball.id !== otherBall.id) {
            const dx = otherBall.x - ball.x;
            const dy = otherBall.y - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = ball.radius + otherBall.radius;

            if (distance < minDistance) {
              const angle = Math.atan2(dy, dx);
              const targetX = ball.x + Math.cos(angle) * minDistance;
              const targetY = ball.y + Math.sin(angle) * minDistance;
              const ax = (targetX - otherBall.x) * 0.1;
              const ay = (targetY - otherBall.y) * 0.1;

              ball.velocity.x -= ax;
              ball.velocity.y -= ay;
              otherBall.velocity.x += ax;
              otherBall.velocity.y += ay;
            }
          }
        }

        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
          ball.velocity.x *= -0.9; 
        }
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
          ball.velocity.y *= -0.9; 
        }

        ball.x += ball.velocity.x;
        ball.y += ball.velocity.y;

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [balls]);

  const startGame = () => {
    const initialPositions: { x: number; y: number }[] = [
      { x: 200, y: 200 },
      { x: 300, y: 200 },
      { x: 400, y: 200 },
      { x: 500, y: 200 },
      { x: 600, y: 200 }
    ];

    const newBalls: Ball[] = initialPositions.map((position, index) => ({
      id: index + 1,
      x: position.x,
      y: position.y,
      radius: index % 2 === 0 ? 15 : 20,
      color: 'black',
      velocity: { x: 0, y: 0 }
    }));

    setBalls(newBalls);
  };

  const changeBallColor = (color: string) => {
    if (selectedBall) {
      selectedBall.color = color;
      setBalls([...balls]);
    }
  };

  return (
    <div className="billiards-container" style={{ marginTop: '10px' }}>
      <canvas
        ref={canvasRef}
        width={900}
        height={400}
        style={{ border: '1px solid black', cursor: isDragging ? 'grabbing' : 'grab', marginRight: '10px'  }}
      />
      <button onClick={startGame}>Start Game</button>
      {isColorPickerVisible && (
        <div>
          <ColorPicker onSelectColor={changeBallColor} />
        </div>
      )}
    </div>
  );
};

export default BilliardsTable;