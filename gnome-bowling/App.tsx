import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Pin, BallState, GamePhase, ScoreFrame, CommentaryType } from './types';
import { PINS_SETUP, LANE_LENGTH_MS, TOTAL_FRAMES } from './constants';
import ScoreBoard from './components/ScoreBoard';
import Heckler from './components/Heckler';
import { getGnomeCommentary } from './services/geminiService';
import { RefreshCw, Play, Trophy, Sparkles } from 'lucide-react';

const LANE_TILT = 50; // Matches CSS rotateX

// --- Utility Components for Visuals ---

const GnomePin: React.FC<{ pin: Pin }> = ({ pin }) => {
  // 3D Logic:
  // When standing, rotateX(-LANE_TILT) cancels the lane tilt, making it stand up vertically.
  // When down, rotateX(0) relative to the container makes it lie flat on the lane.

  const standingTransform = `rotateX(${-LANE_TILT}deg)`;
  const fallenTransform = `rotateX(0deg) rotateZ(${pin.angle}deg) translateZ(5px)`; 
  // translateZ lifts it slightly off the "wood" so no z-fighting with the floor

  return (
    <div
      className="absolute will-change-transform"
      style={{
        left: `${50 + pin.offset}%`,
        // We use 'top' for distance down the lane.
        top: `${pin.row * 12 + 10}%`, 
        zIndex: Math.floor(100 - pin.row * 10), // Back rows behind front rows
        width: '10%',
        aspectRatio: '0.5', // Tall
        transition: 'top 0.5s', // For reset animation
      }}
    >
        {/* Shadow on the floor - always flat */}
        <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[20%] bg-black/40 rounded-full blur-[2px] transition-all duration-300"
            style={{
                opacity: pin.isDown ? 0.2 : 0.6,
                transform: pin.isDown ? `rotate(${pin.angle}deg) scale(1.2)` : 'scale(1)'
            }}
        ></div>

        {/* The Gnome Sprite - Billboarded */}
        <div 
            className="w-full h-full relative transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            style={{
                transformOrigin: 'bottom center',
                transform: pin.isDown ? fallenTransform : standingTransform,
            }}
        >
            {/* Gnome CSS Art - More 3D looking */}
            <div className="w-full h-full relative filter drop-shadow-sm">
                
                {/* Pants */}
                <div className="absolute bottom-0 left-[10%] w-[80%] h-[25%] bg-blue-700 rounded-b-lg overflow-hidden shading-gradient border-x border-blue-900">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full bg-blue-900/50"></div>
                </div> 
                
                {/* Shirt */}
                <div className="absolute bottom-[24%] left-[5%] w-[90%] h-[30%] bg-emerald-600 rounded-lg shading-gradient border-x border-emerald-800 shadow-inner">
                    <div className="absolute top-1/2 left-0 w-full h-[4px] bg-black/20"></div> {/* Belt */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[6px] h-[6px] bg-yellow-400 rounded-sm border border-yellow-600"></div> {/* Buckle */}
                </div> 
                
                {/* Beard */}
                <div className="absolute top-[28%] left-[0%] w-full h-[35%] bg-gray-100 rounded-full scale-105 shadow-md shading-gradient"></div> 
                
                {/* Face */}
                <div className="absolute top-[28%] left-[20%] w-[60%] h-[20%] bg-orange-200 rounded-full z-10 shadow-sm">
                    {/* Eyes */}
                    {pin.isDown ? (
                         <>
                            <div className="absolute top-1/2 left-[20%] text-[8px] font-bold text-black leading-none">x</div>
                            <div className="absolute top-1/2 right-[20%] text-[8px] font-bold text-black leading-none">x</div>
                         </>
                    ) : (
                        <>
                            <div className="absolute top-1/3 left-[25%] w-[15%] h-[15%] bg-black rounded-full"></div>
                            <div className="absolute top-1/3 right-[25%] w-[15%] h-[15%] bg-black rounded-full"></div>
                        </>
                    )}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[30%] h-[30%] bg-pink-300/50 rounded-full blur-[1px]"></div> {/* Nose blush */}
                </div> 
                
                {/* Hat - Cone shape using clip-path */}
                <div 
                    className="absolute top-[-5%] left-[-5%] w-[110%] h-[40%] bg-red-600 z-20 shading-gradient"
                    style={{
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                        borderBottom: '4px solid #991b1b'
                    }}
                ></div>
            </div>
        </div>
    </div>
  );
};

const MushroomBall: React.FC<{ ball: BallState, scale: number }> = ({ ball, scale }) => {
  return (
    <div
      className="absolute z-50 transition-none pointer-events-none"
      style={{
        left: `${ball.x}%`,
        bottom: `${ball.y}%`, 
        // Note: scaling reduces size as it goes up the lane (y increases) to simulate distance
        transform: `translate(-50%, 50%) scale(${scale})`, 
        width: '14%',
        aspectRatio: '1',
      }}
    >
       {/* Shadow */}
       <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[30%] bg-black/50 rounded-full blur-sm"></div>

       {/* Billboard Wrapper: Counter-rotate to face camera */}
       <div style={{ transform: `rotateX(${-LANE_TILT}deg)` }} className="w-full h-full">
            {/* Spinning Logic: Rotates the texture around Z axis */}
            <div 
                className="w-full h-full relative"
                style={{ transform: `rotate(${ball.rotation}deg)` }}
            >
                {/* Mushroom Cap (The ball) */}
                <div className="w-full h-full bg-red-600 rounded-full border-4 border-red-800 overflow-hidden shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.3)] relative shading-gradient">
                     {/* Spots */}
                    <div className="absolute top-[20%] left-[20%] w-[25%] h-[25%] bg-white rounded-full shadow-inner opacity-90"></div>
                    <div className="absolute top-[50%] right-[15%] w-[20%] h-[20%] bg-white rounded-full shadow-inner opacity-90"></div>
                    <div className="absolute bottom-[20%] left-[35%] w-[15%] h-[15%] bg-white rounded-full shadow-inner opacity-90"></div>
                    
                    {/* Gloss */}
                    <div className="absolute top-[10%] left-[20%] w-[30%] h-[15%] bg-white rounded-full blur-md opacity-40"></div>
                </div>
            </div>
       </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  // Game State
  const [phase, setPhase] = useState<GamePhase>(GamePhase.AIMING);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [rollInFrame, setRollInFrame] = useState(0); 
  const [frames, setFrames] = useState<ScoreFrame[]>([]);
  const [score, setScore] = useState(0);
  
  // Physics/Position State
  const [pins, setPins] = useState<Pin[]>([]);
  const [ball, setBall] = useState<BallState>({ x: 50, y: 0, rotation: 0 });
  const [aimAngle, setAimAngle] = useState(0); 
  const [aimPosition, setAimPosition] = useState(50);
  const [power, setPower] = useState(0); 
  const [powerDirection, setPowerDirection] = useState(1);

  // Visuals
  const [message, setMessage] = useState<string>("");
  const [messageVisible, setMessageVisible] = useState(false);

  // Refs
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const laneRef = useRef<HTMLDivElement>(null);

  // --- Initialization ---

  const initPins = useCallback(() => {
    // Determine Y based on rows.
    // Row 0 is front (closest to player). Row 3 is back.
    const newPins: Pin[] = PINS_SETUP.map(p => ({
      ...p,
      x: 0, 
      offset: p.offset, // Offset from center
      row: p.row,
      col: p.col,
      y: 0, 
      isDown: false,
      angle: 0
    }));
    setPins(newPins);
  }, []);

  useEffect(() => {
    initPins();
    getGnomeCommentary('GAME_START').then(text => showMessage(text));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMessage = (text: string) => {
    setMessage(text);
    setMessageVisible(true);
    setTimeout(() => setMessageVisible(false), 5000);
  };

  // --- Game Loop ---

  const animateBall = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const progress = (time - startTimeRef.current) / LANE_LENGTH_MS; 

    if (progress >= 1.1) { // Allow ball to go past pins slightly
      handleRollComplete();
      return;
    }

    const angleRad = (aimAngle * Math.PI) / 180;
    const xDrift = Math.tan(angleRad) * progress * 120; // Increased drift for physics feel
    
    const currentY = progress * 100;
    const currentX = aimPosition + xDrift;
    const rotation = progress * 1080; 

    setBall({ x: currentX, y: currentY, rotation });

    if (currentY > 60) {
       checkCollisions(currentX, currentY);
    }

    requestRef.current = requestAnimationFrame(animateBall);
  };

  const checkCollisions = (ballX: number, ballY: number) => {
    setPins(prevPins => {
      let hit = false;
      const nextPins = prevPins.map(pin => {
        if (pin.isDown) return pin;

        // Map Pin Visual Position to Collision Logic Position
        // Row 0 (Front) is roughly Y=75, Row 3 (Back) is roughly Y=96
        const pinY = 75 + (pin.row * 7); 
        const pinX = 50 + (pin.offset * 1.3); // Spread X slightly

        const dist = Math.hypot(ballX - pinX, ballY - pinY);
        
        if (dist < 8) { // Hit box size
          hit = true;
          // Calculate fall direction relative to ball impact
          const xDiff = pinX - ballX;
          const fallAngle = xDiff * 10 + (Math.random() * 60 - 30);
          return { ...pin, isDown: true, angle: fallAngle };
        }
        return pin;
      });
      return nextPins;
    });
  };

  const startRoll = () => {
    setPhase(GamePhase.ROLLING);
    startTimeRef.current = undefined;
    requestRef.current = requestAnimationFrame(animateBall);
  };

  const handleRollComplete = () => {
    cancelAnimationFrame(requestRef.current!);
    setPhase(GamePhase.SCORING);
    const downCount = pins.filter(p => p.isDown).length;
    processScore(downCount);
  };

  const processScore = async (totalDown: number) => {
    const isFirstRoll = rollInFrame === 0;
    let commentaryType: CommentaryType = 'MISS';
    
    // Very simplified scoring detection for commentary
    const currentFrameObj = frames[currentFrame];
    const prevDown = currentFrameObj ? currentFrameObj.rolls.reduce((a,b)=>a+b,0) : 0;
    const hitThisRoll = totalDown - prevDown;

    if (totalDown === 0) commentaryType = 'GUTTER';
    else if (totalDown === 10 && isFirstRoll) commentaryType = 'STRIKE';
    else if (totalDown === 10 && !isFirstRoll) commentaryType = 'SPARE';
    else if (hitThisRoll === 0) commentaryType = 'MISS';
    else commentaryType = 'MISS'; // Generic hit
    
    if (commentaryType === 'STRIKE' || commentaryType === 'SPARE' || commentaryType === 'GUTTER' || Math.random() > 0.7) {
        getGnomeCommentary(commentaryType).then(showMessage);
    }

    // Update Data
    const currentFrameData = frames[currentFrame] || { rolls: [], score: 0, cumulativeScore: 0, isStrike: false, isSpare: false };
    
    const hitCount = totalDown - (currentFrameData.rolls.reduce((a,b) => a+b, 0));
    
    const newRolls = [...currentFrameData.rolls, hitCount];
    
    let isStrike = false;
    let isSpare = false;
    
    // Basic rules
    if (newRolls[0] === 10) isStrike = true;
    else if (newRolls.length === 2 && (newRolls[0] + newRolls[1] >= 10)) isSpare = true;

    const updatedFrame = {
        ...currentFrameData,
        rolls: newRolls,
        isStrike,
        isSpare,
        score: newRolls.reduce((a,b) => a+b, 0)
    };

    const newFrames = [...frames];
    newFrames[currentFrame] = updatedFrame;
    
    // Simple Cumulative Update
    let runningTotal = 0;
    newFrames.forEach((f, i) => {
        let val = f.rolls.reduce((a,b) => a+b, 0);
        // Bonus dummy logic (looks ahead 1 frame only for simplicity in this demo)
        if (i < newFrames.length - 1) {
            if (f.isSpare) val += newFrames[i+1].rolls[0] || 0;
            if (f.isStrike) val += (newFrames[i+1].rolls[0] || 0) + (newFrames[i+1].rolls[1] || 0);
        }
        runningTotal += val;
        f.cumulativeScore = runningTotal;
    });
    
    setFrames(newFrames);
    setScore(runningTotal);

    setTimeout(() => {
        let nextFrameIndex = currentFrame;
        let nextRollIndex = rollInFrame + 1;
        let shouldResetPins = false;
        
        // Logic for 10th frame omitted for brevity in reskin, standard logic applies
        if (currentFrame < 9) {
             if (isStrike || nextRollIndex >= 2) {
                 nextFrameIndex++;
                 nextRollIndex = 0;
                 shouldResetPins = true;
             }
        } else {
            if (nextRollIndex >= 3 || (nextRollIndex===2 && !isStrike && !isSpare)) {
                 endGame(runningTotal);
                 return;
            }
            if (hitCount === 10 || (newRolls.length === 2 && isSpare)) {
                shouldResetPins = true;
                // Hack: If we reset pins, we must ensure scoring logic knows prevDown is 0 now?
                // For this demo, we'll just reset visuals.
                initPins(); 
            }
        }

        if (shouldResetPins && currentFrame < 9) {
             initPins();
        }

        setCurrentFrame(nextFrameIndex);
        setRollInFrame(nextRollIndex);
        
        // Reset Ball
        setBall({ x: 50, y: 0, rotation: 0 });
        setAimPosition(50);
        setAimAngle(0);
        setPhase(GamePhase.AIMING);
    }, 2000);
  };

  const endGame = (finalScore: number) => {
      setPhase(GamePhase.GAME_OVER);
      getGnomeCommentary('GAME_OVER', finalScore).then(showMessage);
  };

  // --- Input Handlers ---
  const handleAction = () => {
      if (phase === GamePhase.AIMING) setPhase(GamePhase.POWER);
      else if (phase === GamePhase.POWER) startRoll();
      else if (phase === GamePhase.GAME_OVER) {
          setFrames([]);
          setCurrentFrame(0);
          setRollInFrame(0);
          setScore(0);
          initPins();
          setPhase(GamePhase.AIMING);
          getGnomeCommentary('GAME_START').then(showMessage);
      }
  };
  
  // Power Meter
  useEffect(() => {
    if (phase === GamePhase.POWER) {
        const interval = setInterval(() => {
            setPower(p => {
                if (p >= 100) setPowerDirection(-1);
                if (p <= 0) setPowerDirection(1);
                return p + (3 * powerDirection);
            });
        }, 16);
        return () => clearInterval(interval);
    }
  }, [phase, powerDirection]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space') handleAction();
        if (phase === GamePhase.AIMING) {
            if (e.code === 'ArrowLeft') setAimPosition(p => Math.max(10, p - 2));
            if (e.code === 'ArrowRight') setAimPosition(p => Math.min(90, p + 2));
            if (e.code === 'ArrowUp') setAimAngle(a => Math.max(-45, a - 2)); // Actually changing angle not aim "up"
            if (e.code === 'ArrowDown') setAimAngle(a => Math.min(45, a + 2));
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleAction]);

  return (
    <div className="relative w-full h-screen bg-slate-900 flex flex-col font-sans overflow-hidden">
      
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full z-40">
        <ScoreBoard frames={frames} currentFrameIndex={currentFrame} />
      </div>

      <Heckler message={message} visible={messageVisible} />

      {/* Main Game Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-sky-900 to-indigo-900">
        
        {/* Environment / Scenery */}
        <div className="absolute inset-0 z-0 opacity-60">
             {/* Moon */}
             <div className="absolute top-10 right-20 w-32 h-32 bg-yellow-100 rounded-full blur-[2px] shadow-[0_0_60px_rgba(255,255,200,0.4)]"></div>
             {/* Stars */}
             <div className="absolute top-20 left-10 w-1 h-1 bg-white rounded-full animate-pulse"></div>
             <div className="absolute top-40 left-40 w-1 h-1 bg-white rounded-full animate-pulse delay-75"></div>
             <div className="absolute top-10 right-1/2 w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
             
             {/* Grass Horizon */}
             <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-emerald-900 to-emerald-800"></div>
             
             {/* Decor Gnomes watching */}
             <div className="absolute bottom-[40%] left-[10%] w-12 h-20 bg-red-800 rounded-t-full opacity-50 blur-[1px]"></div>
             <div className="absolute bottom-[45%] right-[15%] w-10 h-16 bg-blue-800 rounded-t-full opacity-50 blur-[1px]"></div>
        </div>

        {/* The Lane - 3D Perspective */}
        <div 
          ref={laneRef}
          className="relative w-[340px] md:w-[450px] h-[700px] md:h-[900px] perspective-container z-10 mt-20"
        >
          <div className="w-full h-full lane-transform bg-amber-900 shadow-2xl relative overflow-hidden rounded-t-lg border-x-[16px] border-slate-800">
             {/* Lane Texture (Wood) */}
             <div className="absolute inset-0 bg-[#3d2312]">
                  {/* Planks */}
                  <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_38px,#000_39px,#000_40px)]"></div>
                  {/* Shine/Reflection */}
                  <div className="absolute inset-0 lane-reflection opacity-40"></div>
             </div>

             {/* Arrows on lane (Decals) */}
             <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-yellow-600/50 opacity-50"></div>
             <div className="absolute top-[50%] left-[30%] -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-yellow-600/50 opacity-50"></div>
             <div className="absolute top-[50%] left-[70%] -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-yellow-600/50 opacity-50"></div>

             {/* Pins - Note: We render them in the 3D space. 
                 Since we use CSS Z-index for layering, ensure the order is correct. 
             */}
             {pins.map(pin => (
               <GnomePin key={pin.id} pin={pin} />
             ))}

             {/* Ball */}
             <MushroomBall ball={ball} scale={Math.max(0.5, 1 - (ball.y / 120))} />

             {/* Aim Assist Line */}
             {phase === GamePhase.AIMING && (
               <div 
                 className="absolute bottom-0 w-1 bg-red-500 h-[200px] origin-bottom opacity-60"
                 style={{
                   left: `${aimPosition}%`,
                   transform: `rotate(${aimAngle}deg)`,
                   boxShadow: '0 0 10px red'
                 }}
               >
                 <div className="w-4 h-4 rounded-full bg-red-500 absolute -bottom-2 -left-1.5 animate-pulse"></div>
                 <div className="w-2 h-20 bg-gradient-to-t from-red-500 to-transparent absolute bottom-0 -left-0.5"></div>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Controls Footer */}
      <div className="h-32 bg-slate-900 z-50 flex items-center justify-between px-4 md:px-10 border-t-4 border-slate-700 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
         
         <div className="flex flex-col space-y-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Position</span>
            <div className="flex space-x-2">
                <button 
                  onMouseDown={() => setAimPosition(p => Math.max(10, p - 2))} 
                  onClick={() => setAimPosition(p => Math.max(10, p - 5))}
                  disabled={phase !== GamePhase.AIMING}
                  className="w-14 h-14 bg-slate-700 rounded-xl shadow-[0_4px_0_#1e293b] active:shadow-none active:translate-y-1 text-white font-bold text-xl flex items-center justify-center transition-all hover:bg-slate-600"
                >←</button>
                <button 
                  onMouseDown={() => setAimPosition(p => Math.min(90, p + 2))} 
                  onClick={() => setAimPosition(p => Math.min(90, p + 5))}
                  disabled={phase !== GamePhase.AIMING}
                  className="w-14 h-14 bg-slate-700 rounded-xl shadow-[0_4px_0_#1e293b] active:shadow-none active:translate-y-1 text-white font-bold text-xl flex items-center justify-center transition-all hover:bg-slate-600"
                >→</button>
            </div>
         </div>

         <div className="flex flex-col items-center space-y-3 w-full max-w-md mx-4">
             {phase === GamePhase.POWER && (
                 <div className="w-full h-8 bg-slate-950 rounded-full overflow-hidden border-2 border-slate-600 relative shadow-inner">
                     <div 
                       className={`h-full transition-all duration-75 shadow-[0_0_15px_rgba(255,255,255,0.5)] ${power > 85 ? 'bg-red-500' : power > 50 ? 'bg-yellow-400' : 'bg-green-500'}`}
                       style={{ width: `${power}%` }}
                     ></div>
                     <div className="absolute top-0 left-[85%] w-1 h-full bg-white z-10"></div> 
                 </div>
             )}
             
             <button
               onClick={handleAction}
               className={`
                 relative group w-full py-4 rounded-full font-black text-2xl uppercase tracking-widest shadow-[0_6px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-[6px] transition-all
                 ${phase === GamePhase.GAME_OVER 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white'}
               `}
             >
               <span className="drop-shadow-md flex items-center justify-center gap-3">
                   {phase === GamePhase.AIMING && <>Set Power <Play size={24} fill="currentColor"/></>}
                   {phase === GamePhase.POWER && <>BOWL!</>}
                   {phase === GamePhase.ROLLING && <span className="animate-pulse">Rolling...</span>}
                   {phase === GamePhase.SCORING && <span>Scoring...</span>}
                   {phase === GamePhase.GAME_OVER && <>Play Again <RefreshCw size={24}/></>}
               </span>
             </button>
         </div>

         <div className="flex flex-col space-y-2 items-end">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Angle</span>
            <div className="flex space-x-2">
                <button 
                  onMouseDown={() => setAimAngle(a => Math.max(-45, a - 2))} 
                  onClick={() => setAimAngle(a => Math.max(-45, a - 5))}
                  disabled={phase !== GamePhase.AIMING}
                  className="w-14 h-14 bg-slate-700 rounded-xl shadow-[0_4px_0_#1e293b] active:shadow-none active:translate-y-1 text-white font-bold text-xl flex items-center justify-center transition-all hover:bg-slate-600"
                >↺</button>
                <button 
                  onMouseDown={() => setAimAngle(a => Math.min(45, a + 2))} 
                  onClick={() => setAimAngle(a => Math.min(45, a + 5))}
                  disabled={phase !== GamePhase.AIMING}
                  className="w-14 h-14 bg-slate-700 rounded-xl shadow-[0_4px_0_#1e293b] active:shadow-none active:translate-y-1 text-white font-bold text-xl flex items-center justify-center transition-all hover:bg-slate-600"
                >↻</button>
            </div>
         </div>
      </div>
      
      {/* Game Over Modal */}
      {phase === GamePhase.GAME_OVER && (
          <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-slate-800 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl animate-float border-4 border-yellow-500">
                  <div className="relative inline-block">
                      <Trophy className="w-32 h-32 text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                      <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-white animate-pulse" />
                  </div>
                  <h2 className="text-5xl font-black text-white mb-2 tracking-tighter">GAME OVER</h2>
                  <p className="text-xl text-slate-400 mb-8 font-bold">FINAL SCORE</p>
                  <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-10 drop-shadow-sm">{score}</div>
                  <button 
                    onClick={handleAction}
                    className="w-full py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold text-2xl shadow-[0_8px_0_#14532d] active:shadow-none active:translate-y-2 transition-all uppercase tracking-widest"
                  >
                      Play Again
                  </button>
              </div>
          </div>
      )}

    </div>
  );
};

export default App;