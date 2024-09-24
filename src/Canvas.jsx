import React, { useRef, useEffect, useState } from 'react';
import Score from '../components/Score';

const Canvas = () => {
  const canvasRef = useRef(null);

  const paddleHeight = 96, paddleWidth = 16;
  const paddleOffset = 0;
  const pongSize = 12;
  const paddleSpeed = 8; // Movement paddleSpeed size
  const pongSpeed = 3;
  const initialY = window.innerHeight/2 - (paddleHeight/2)
  const initSelf = { x: paddleOffset, y: initialY }
  const initOpp = { x: window.innerWidth - paddleOffset - paddleWidth, y: initialY }
  const initPong = {x: window.innerWidth/2 - (pongSize/2), y: window.innerHeight/2 - (pongSize/2)}
  const [self, setSelf] = useState(initSelf); 
  const [opp, setOpp] = useState(initOpp); 
  const [pong, setPong] = useState(initPong)
  const [direction, setDirection] = useState({x: -1, y: 1})
  const [gameRunning, setGameRunning] = useState(true)
  const [selfScore, setSelfScore] = useState(0)
  const [oppScore, setOppScore] = useState(0)

  const [keysPressed, setKeysPressed] = useState({});


  // For drawing and re-drawing the canvas whenever position changes (every frame)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d');

    const paddleSprite = new Image();
    paddleSprite.src = '../assets/sprite.png'; 
    
    const pongSprite = new Image();
    pongSprite.src = '../assets/sprite.png'; 

    const drawImage = (ctx, paddleSprite, x, y, width, height) => {
      ctx.drawImage(paddleSprite, x, y, width, height);
    };

    const pongLeft = pong.x;
    const pongRight = pong.x + pongSize;
    const pongTop = pong.y;
    const pongBottom = pong.y + pongSize;

    const selfRight = self.x + paddleWidth;
    const selfTop = self.y
    const selfBottom = self.y + paddleHeight;

    const oppLeft = opp.x
    const oppTop = opp.y
    const oppBottom = opp.y + paddleHeight;

    // collision between self and pong
    if (pongLeft < selfRight && pongBottom > selfTop && pongTop < selfBottom) {
      const leftCollisionDist = Math.abs(selfRight - pongLeft)
      const topCollisionDist = Math.abs(selfBottom - pongTop)
      const bottomCollisionDist = Math.abs(selfTop - pongBottom)
      const minDist = Math.min(leftCollisionDist,topCollisionDist,bottomCollisionDist);
      if(minDist == leftCollisionDist){
        setDirection(prev => ({...prev, x: 1}))
      } else if(minDist == topCollisionDist){
        setDirection(prev => ({...prev, y: prev.y * -1}))
      } else if(minDist == bottomCollisionDist){
        setDirection(prev => ({...prev, y: prev.y * -1}))
      }
    }

    if (pongRight > oppLeft && pongBottom > oppTop && pongTop < oppBottom) {
      const rightCollisionDist = Math.abs(oppLeft - pongRight)
      const topCollisionDist = Math.abs(oppBottom - pongTop)
      const bottomCollisionDist = Math.abs(oppTop - pongBottom)
      const minDist = Math.min(rightCollisionDist,topCollisionDist,bottomCollisionDist);
      if(minDist == rightCollisionDist){
        setDirection(prev => ({...prev, x: -1}))
      } else if(minDist == topCollisionDist){
        setDirection(prev => ({...prev, y: prev.y * -1}))
      } else if(minDist == bottomCollisionDist){
        setDirection(prev => ({...prev, y: prev.y * -1}))
      }
    }


    if(pongTop <= 0 || pongBottom >= window.innerHeight){
      setDirection(prev => ({...prev, y: prev.y * -1}))
    }

    const gameOver = () => {
      if(pongRight <= paddleWidth) setOppScore(prev => prev+1);
      if(pongLeft >= window.innerWidth - paddleWidth) setSelfScore(prev => prev+1)
      return (pongRight <= paddleWidth || pongLeft >= window.innerWidth - paddleWidth)
    }

    if(gameOver()) {
      setSelf(initSelf)
      setOpp(initOpp)
      setPong(initPong)
      setDirection({x: 0, y: 0})
      // Freeze pong for some time before next round
      setTimeout(() => {
        setDirection({x: -1, y: 1})
      }, 1500);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame
    drawImage(ctx, paddleSprite, self.x, self.y, paddleWidth, paddleHeight); // Self paddle
    drawImage(ctx, paddleSprite, opp.x, opp.y, paddleWidth, paddleHeight); // Opponent paddle
    drawImage(ctx, pongSprite, pong.x, pong.y, pongSize, pongSize); // Pong
  }, [self, opp, pong]);

  // key down
  const handleKeyDown = (event) => {
    setKeysPressed((prev) => ({ ...prev, [event.key]: true }));
  };

  // key release
  const handleKeyUp = (event) => {
    setKeysPressed((prev) => ({ ...prev, [event.key]: false }));
  };

  // Input processing
  useEffect(() => {
    let animationFrameId;

    const process = () => {
      if (!gameRunning) {
        cancelAnimationFrame(animationFrameId);
        return;
      }
      const canvas = canvasRef.current

      setSelf((prev) => {
        // let newX = prev.x;
        let newY = prev.y;

        if (keysPressed['ArrowUp']) newY = Math.max(newY-paddleSpeed,0);
        if (keysPressed['ArrowDown']) newY = Math.min(newY+paddleSpeed,canvas.height-paddleHeight);

        return { x: paddleOffset, y: newY };
      });

      setPong((prev) => {
        let newXPos = prev.x + (direction.x * pongSpeed)
        let newYPos = prev.y + (direction.y * pongSpeed)
        return {x: newXPos, y: newYPos}
      })

      // KEEP THE LOOP RUNNING
      animationFrameId = requestAnimationFrame(process); 
    };

    // Event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // START THE ANIMATION LOOP
    animationFrameId = requestAnimationFrame(process);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [keysPressed, direction, gameRunning]);

  return (
    <div>
      <Score leftScore={selfScore} rightScore={oppScore} />
      <canvas ref={canvasRef} height={window.innerHeight} width={window.innerWidth} />
    </div>
  );
};

export default Canvas;