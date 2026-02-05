
import React, { useMemo } from 'react';
import { Sky, Cloud, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

export const NatureScene = () => {
  const trees = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 60,
        0,
        (Math.random() - 0.5) * 60,
      ],
      scale: 1 + Math.random() * 2,
    }));
  }, []);

  return (
    <>
      <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
      <Cloud opacity={0.5} speed={0.4} width={10} depth={1.5} segments={20} position={[0, 10, 0]} />
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#8fb339" />
      </mesh>

      {/* Trees */}
      {trees.map((tree, i) => (
        <group key={i} position={tree.position as any} scale={tree.scale}>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.1, 0.2, 2]} />
            <meshStandardMaterial color="#4a3728" />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <coneGeometry args={[0.8, 2, 8]} />
            <meshStandardMaterial color="#2d5a27" />
          </mesh>
        </group>
      ))}

      {/* Scattered Rocks */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[5, 0.2, -8]}>
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#7a7a7a" />
        </mesh>
      </Float>
    </>
  );
};

export const NeighborhoodScene = () => {
  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.5} />
      
      {/* Sidewalk & Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[100, 10]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 10]}>
        <planeGeometry args={[100, 10]} />
        <meshStandardMaterial color="#999" />
      </mesh>

      {/* Houses (stylized blocks) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={i} position={[(i - 3) * 15, 2, -8]}>
          <mesh>
            <boxGeometry args={[8, 4, 8]} />
            <meshStandardMaterial color={['#f4a261', '#e76f51', '#2a9d8f'][i % 3]} />
          </mesh>
          <mesh position={[0, 3, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[6.5, 3, 4]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>
        </group>
      ))}
    </>
  );
};
