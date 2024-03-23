import React, { useRef, useEffect, useState } from 'react';

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
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [startPosition, setStartPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedBall, setSelectedBall] = useState<Ball | null>(null);
  const [ballColors] = useState<string[]>(['red', 'green', 'blue', 'yellow', 'orange']);

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
          setIsMoving(true);
          setStartPosition({ x: mouseX, y: mouseY });
          break;
        }
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMoving) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      setMousePosition({ x: mouseX, y: mouseY });
    };

    const handleMouseUp = () => {
      if (isMoving && selectedBall) {
        const velocityX = (mousePosition.x - startPosition.x) / 10;
        const velocityY = (mousePosition.y - startPosition.y) / 10;
        selectedBall.velocity = { x: velocityX, y: velocityY };
        setSelectedBall(null);
      }

      setIsMoving(false);
    };

    const handleDoubleClick = () => {
      if (selectedBall) {
        const newColor = ballColors[Math.floor(Math.random() * ballColors.length)];
        selectedBall.color = newColor;
        setBalls([...balls.filter(ball => ball.id !== selectedBall.id), selectedBall]);
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('dblclick', handleDoubleClick);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [balls, isMoving, mousePosition, startPosition, selectedBall, ballColors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const ball of balls) {
        ball.x += ball.velocity.x;
        ball.y += ball.velocity.y;

        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
          ball.velocity.x *= -1;
        }

        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
          ball.velocity.y *= -1;
        }

        for (const otherBall of balls) {
          if (ball.id !== otherBall.id) {
            const dx = ball.x - otherBall.x;
            const dy = ball.y - otherBall.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < ball.radius + otherBall.radius) {
              const tempVelocity = { ...ball.velocity };
              ball.velocity = { ...otherBall.velocity };
              otherBall.velocity = { ...tempVelocity };
              
              const collisionVector = { x: ball.x - otherBall.x, y: ball.y - otherBall.y };
              const length = Math.sqrt(collisionVector.x * collisionVector.x + collisionVector.y * collisionVector.y);
              const pushDistance = (ball.radius + otherBall.radius - length) / 2;
              const pushX = (collisionVector.x / length) * pushDistance;
              const pushY = (collisionVector.y / length) * pushDistance;
              ball.x += pushX;
              ball.y += pushY;
              otherBall.x -= pushX;
              otherBall.y -= pushY;
            }
          }
        }

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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const radius = 20;
    const startX = canvas.width / 2;
    const startY = canvas.height - 50;
    const yOffset = Math.sqrt(3) * radius;
    const numLayers = 5;

    const newBalls: Ball[] = [];

    for (let i = 0; i < numLayers; i++) {
      for (let j = 0; j <= i; j++) {
        const ball: Ball = {
          id: newBalls.length + 1,
          x: startX - i * radius + j * radius * 2,
          y: startY - i * yOffset,
          radius,
          color: ballColors[Math.floor(Math.random() * ballColors.length)],
          velocity: { x: 0, y: 0 },
        };

        newBalls.push(ball);
      }
    }

    setBalls(newBalls);
  };

  const changeColor = (color: string) => {
    if (!selectedBall) return;
    selectedBall.color = color;
    setSelectedBall({ ...selectedBall });
  };

  return (
    <div className="billiards-container"
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingTop: '10px' }}
    >
      <canvas ref={canvasRef} width={800} height={500} style={{ border: '2px solid black', marginBottom: '10px' }} />
      <button onClick={startGame}>Start Game</button>
      {selectedBall && (
        <div className="color-menu">
        <span>Select Color: </span>
        {ballColors.map((color, index) => (
        <button key={index} style={{ backgroundColor: color }} onClick={() => changeColor(color)} />
      ))}
    </div>
  )}
</div>
);
};

export default BilliardsTable;




