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
  isColorPickerOpen: boolean;
}

const BilliardsTable: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [startPosition, setStartPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedBall, setSelectedBall] = useState<Ball | null>(null);
  const [ballColors] = useState<string[]>(['red', 'green', 'blue', 'yellow', 'orange']);
  const [ballRadiuses] = useState<number[]>([15, 20, 25, 30]);

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
        selectedBall.isColorPickerOpen = true;
        setBalls([...balls]);
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
  }, [balls, isMoving, mousePosition, startPosition, selectedBall]);

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

        if (ball.isColorPickerOpen) {
          drawColorPicker(ctx, ball);
        }
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [balls]);

  const startGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = canvas.width / 2;
    const startY = canvas.height - 50;
    const yOffset = Math.sqrt(3) * ballRadiuses[ballRadiuses.length - 1];
    const numLayers = 5;

    const newBalls: Ball[] = [];

    for (let i = 0; i < numLayers; i++) {
      for (let j = 0; j <= i; j++) {
        const ball: Ball = {
          id: newBalls.length + 1,
          x: startX - i * ballRadiuses[j] + j * ballRadiuses[ballRadiuses.length - 1] * 2,
          y: startY - i * yOffset,
          radius: ballRadiuses[j],
          color: ballColors[Math.floor(Math.random() * ballColors.length)],
          velocity: { x: 0, y: 0 },
          isColorPickerOpen: false,
        };

        newBalls.push(ball);
      }
    }

    setBalls(newBalls);
  };

  const changeColor = (color: string) => {
    if (!selectedBall) return;
      selectedBall.color = color
      selectedBall.isColorPickerOpen = false;
      setBalls([...balls]); 
    };
  
    const drawColorPicker = (ctx: CanvasRenderingContext2D, ball: Ball) => {
      const dropdownWidth = 100;
      const dropdownHeight = 50;
      const dropdownX = ball.x - dropdownWidth / 2;
      const dropdownY = ball.y - ball.radius - dropdownHeight;
  
      ctx.beginPath();
      ctx.rect(dropdownX, dropdownY, dropdownWidth, dropdownHeight);
      ctx.fillStyle = '#f1f1f1';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
      ctx.closePath();
  
      ctx.font = '12px Arial';
      ctx.fillStyle = '#000000';
      ctx.fillText('Select Color', dropdownX + 10, dropdownY + 20);
  
      const colorY = dropdownY + 30;
      ballColors.forEach((color, index) => {
        ctx.beginPath();
        ctx.rect(dropdownX + 10 + index * 20, colorY, 20, 20);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
      });
    };
  
    return (
      <div className="billiards-container"
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}
      >
        <canvas ref={canvasRef} width={900} height={400} style={{ border: '2px solid black', marginBottom: '10px' }} />
        <h1>Нужно зажать на шар и перетащить вниз мышку, если хотите поменять цвет заливки шара</h1>
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