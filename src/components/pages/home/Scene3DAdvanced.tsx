import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Sphere, 
  MeshDistortMaterial, 
  Float,
  Stars,
  useTexture,
  Environment,
  PerspectiveCamera
} from '@react-three/drei';
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

// Floating geometric shapes
const FloatingShapes: React.FC = () => {
  const shapes = useMemo(() => [
    { position: [3, 2, -2], geometry: 'sphere', color: '#fbbf24' },
    { position: [-3, -1, -3], geometry: 'torus', color: '#60a5fa' },
    { position: [2, -2, -5], geometry: 'octahedron', color: '#ec4899' },
    { position: [-2, 1, -4], geometry: 'tetrahedron', color: '#8b5cf6' },
  ], []);

  return (
    <>
      {shapes.map((shape, index) => (
        <Float
          key={index}
          speed={1 + index * 0.5}
          rotationIntensity={0.5 + index * 0.2}
          floatIntensity={0.5 + index * 0.3}
        >
          <mesh position={shape.position as [number, number, number]}>
            {shape.geometry === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
            {shape.geometry === 'torus' && <torusGeometry args={[0.5, 0.2, 16, 100]} />}
            {shape.geometry === 'octahedron' && <octahedronGeometry args={[0.5]} />}
            {shape.geometry === 'tetrahedron' && <tetrahedronGeometry args={[0.5]} />}
            <meshStandardMaterial
              color={shape.color}
              metalness={0.8}
              roughness={0.2}
              emissive={shape.color}
              emissiveIntensity={0.3}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
};

// Particle field with mouse interaction
const InteractiveParticles: React.FC = () => {
  const count = 200;
  const particlesRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;

      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0.98; colors[i * 3 + 1] = 0.75; colors[i * 3 + 2] = 0.14; // Gold
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 0.38; colors[i * 3 + 1] = 0.65; colors[i * 3 + 2] = 0.98; // Blue
      } else {
        colors[i * 3] = 0.93; colors[i * 3 + 1] = 0.28; colors[i * 3 + 2] = 0.60; // Pink
      }

      sizes[i] = Math.random() * 0.15 + 0.05;
    }

    return { positions, colors, sizes };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      particlesRef.current.rotation.y = time * 0.05;
      
      // Mouse interaction
      const positions = particlesRef.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        const mouseDistance = Math.sqrt(
          Math.pow(x - mouseRef.current.x * 10, 2) + 
          Math.pow(y - mouseRef.current.y * 10, 2)
        );
        
        const wave = Math.sin(time + i * 0.1) * 0.5;
        const mouseEffect = Math.max(0, 1 - mouseDistance / 5) * 2;
        positions.setZ(i, positions.getZ(i) * 0.95 + (wave + mouseEffect) * 0.05);
      }
      positions.needsUpdate = true;
    }
  });

  // Track mouse position
  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Central distorted sphere
const CentralSphere: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[2, 128, 128]} position={[0, 0, -5]}>
        <MeshDistortMaterial
          color="#fbbf24"
          attach="material"
          distort={0.6}
          speed={3}
          roughness={0}
          metalness={1}
          transparent
          opacity={0.8}
        />
      </Sphere>
    </Float>
  );
};

// Enhanced lighting
const SceneLights: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#fbbf24" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#60a5fa" />
      <pointLight position={[0, 5, 5]} intensity={0.8} color="#ec4899" />
      <spotLight
        position={[0, 15, 0]}
        angle={0.5}
        penumbra={1}
        intensity={2}
        castShadow
        color="#ffffff"
      />
    </>
  );
};

// Main Advanced 3D Scene
export const Scene3DAdvanced: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 8, 25]} />
        
        <SceneLights />
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1}
        />
        
        <InteractiveParticles />
        <CentralSphere />
        <FloatingShapes />
        <WaveGrid />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
};
