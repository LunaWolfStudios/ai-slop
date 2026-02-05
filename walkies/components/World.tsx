
import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, OrbitControls, Loader, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Jeremy } from './Game3D/Jeremy';
import { Clank3D } from './Game3D/Clank';
import { NatureScene, NeighborhoodScene } from './Game3D/Environment';
import { GameState, Location } from '../types';
import { generateWalkMoment } from '../services/geminiService';

interface WorldProps {
  state: GameState;
  onUpdate: (update: Partial<GameState>) => void;
  onMoment: (text: string) => void;
}

export const World: React.FC<WorldProps> = ({ state, onUpdate, onMoment }) => {
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 0.8, 0));
  const [lastMomentProg, setLastMomentProg] = useState(0);

  const map = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  ];

  const handlePlayerMove = useCallback((pos: THREE.Vector3) => {
    setPlayerPos(pos.clone());
    
    // Calculate progress based on distance from start
    const dist = pos.length();
    const newProgress = Math.min(100, (dist / 100) * 100);
    
    if (newProgress > state.progress + 0.1) {
      onUpdate({ progress: newProgress, isWalking: true });
    }

    // Trigger narrative every 10% progress
    if (Math.floor(newProgress / 10) > Math.floor(lastMomentProg / 10)) {
      setLastMomentProg(newProgress);
      triggerMoment(newProgress);
    }
  }, [state.progress, lastMomentProg]);

  const triggerMoment = async (prog: number) => {
    const m = await generateWalkMoment(
      state.currentLocation?.name || "The Wild",
      state.currentLocation?.type || "nature",
      state.clankMood,
      prog
    );
    onMoment(m);
  };

  return (
    <div className="w-full h-full relative bg-sky-100">
      <KeyboardControls map={map}>
        <Suspense fallback={null}>
          <Canvas shadows>
            <fog attach="fog" args={['#FDFBF7', 10, 50]} />
            
            {state.currentLocation?.type === 'nature' ? <NatureScene /> : <NeighborhoodScene />}
            
            <Jeremy onMove={handlePlayerMove} />
            <Clank3D targetPos={playerPos} mood={state.clankMood} />
            
            <OrbitControls 
              enablePan={false} 
              enableZoom={false} 
              maxPolarAngle={Math.PI / 2.2} 
              minPolarAngle={Math.PI / 3}
            />
          </Canvas>
        </Suspense>
      </KeyboardControls>
      
      {/* HUD overlays */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <h2 className="text-xl font-serif text-stone-800 bg-white/50 px-4 py-1 rounded-full backdrop-blur-sm">
          {state.currentLocation?.name}
        </h2>
        <div className="w-48 h-1 bg-stone-200 rounded-full mt-2 overflow-hidden mx-auto">
          <div className="h-full bg-amber-500" style={{ width: `${state.progress}%` }} />
        </div>
      </div>

      <div className="absolute bottom-10 left-10 pointer-events-none max-w-xs text-stone-400 text-xs">
        WASD to walk around. Explore the world at your own pace.
      </div>

      <Loader />
    </div>
  );
};
