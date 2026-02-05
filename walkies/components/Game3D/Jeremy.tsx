
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

export const Jeremy = ({ onMove }: { onMove: (pos: THREE.Vector3) => void }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [, getKeys] = useKeyboardControls();
  const speed = 0.15;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const { forward, backward, left, right } = getKeys();
    
    const velocity = new THREE.Vector3();
    if (forward) velocity.z -= 1;
    if (backward) velocity.z += 1;
    if (left) velocity.x -= 1;
    if (right) velocity.x += 1;

    if (velocity.length() > 0) {
      velocity.normalize().multiplyScalar(speed);
      meshRef.current.position.add(velocity);
      
      // Rotate to face direction
      const angle = Math.atan2(velocity.x, velocity.z);
      meshRef.current.rotation.y = angle;

      // Bobbing animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 10) * 0.05 + 0.8;
      onMove(meshRef.current.position);
    } else {
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0.8, 0.1);
    }
  });

  return (
    <group ref={meshRef} position={[0, 0.8, 0]}>
      <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={50} />
      
      {/* Stylized Jeremy - Minimalist Shape */}
      <mesh position={[0, 0.4, 0]}>
        <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#f5d5c5" />
      </mesh>
    </group>
  );
};
