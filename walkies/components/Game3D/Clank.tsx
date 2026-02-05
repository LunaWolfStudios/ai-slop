
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Clank3D = ({ targetPos, mood }: { targetPos: THREE.Vector3, mood: string }) => {
  const clankRef = useRef<THREE.Group>(null);
  const [offset] = useState(() => new THREE.Vector3((Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4));

  useFrame((state, delta) => {
    if (!clankRef.current) return;

    // Follow logic: Lerp towards target with offset
    const desiredPos = targetPos.clone().add(offset);
    desiredPos.y = 0.4; // Keep on ground

    const dist = clankRef.current.position.distanceTo(desiredPos);
    
    if (dist > 1.5) {
      clankRef.current.position.lerp(desiredPos, 0.05);
      
      // Face direction of movement
      const lookDir = desiredPos.clone().sub(clankRef.current.position).normalize();
      const targetRotation = Math.atan2(lookDir.x, lookDir.z);
      clankRef.current.rotation.y = THREE.MathUtils.lerp(clankRef.current.rotation.y, targetRotation, 0.1);
      
      // Walking bounce
      clankRef.current.position.y = Math.sin(state.clock.elapsedTime * 12) * 0.08 + 0.4;
    } else {
      // Idle behavior based on mood
      if (mood === 'sniffing') {
        clankRef.current.rotation.y += Math.sin(state.clock.elapsedTime * 5) * 0.02;
        clankRef.current.position.y = 0.35 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      } else if (mood === 'excited') {
        clankRef.current.position.y = 0.4 + Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.2;
      }
    }
  });

  return (
    <group ref={clankRef} position={[2, 0.4, 2]}>
      {/* Stylized Clank - Low Poly Dog */}
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.4, 0.3, 0.6]} />
        <meshStandardMaterial color="#D97706" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.2, -0.35]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#D97706" />
      </mesh>
      {/* Ears */}
      <mesh position={[0.15, 0.35, -0.3]}>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color="#92400E" />
      </mesh>
      <mesh position={[-0.15, 0.35, -0.3]}>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color="#92400E" />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.15, 0.3]}>
        <boxGeometry args={[0.05, 0.05, 0.3]} />
        <meshStandardMaterial color="#D97706" />
      </mesh>
    </group>
  );
};
