import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Animated wave grid
const WaveGrid: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const gridSize = 50;
  const gridDivisions = 50;

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      const positions = meshRef.current.geometry.attributes.position;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const wave = Math.sin(x * 0.5 + time) * Math.cos(y * 0.5 + time) * 0.5;
        positions.setZ(i, wave);
      }
      
      positions.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[gridSize, gridSize, gridDivisions, gridDivisions]} />
      <meshStandardMaterial
        color="#1e293b"
        wireframe
        transparent
        opacity={0.3}
        emissive="#fbbf24"
        emissiveIntensity={0.1}
      />
    </mesh>
  );
};

// Minimal lighting
const SceneLights: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#fbbf24" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#60a5fa" />
    </>
  );
};

// Minimal 3D Scene with only wave grid
export const Scene3DMinimal: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10">
      <Canvas
        camera={{ position: [0, 2, 10], fov: 60 }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 8, 25]} />
        
        <SceneLights />
        <WaveGrid />
      </Canvas>
    </div>
  );
};
