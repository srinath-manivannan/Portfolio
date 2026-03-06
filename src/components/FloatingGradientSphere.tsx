import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function GradientSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.12;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <MeshDistortMaterial
          color="#4f6ef7"
          emissive="#3b28cc"
          emissiveIntensity={0.4}
          roughness={0.25}
          metalness={0.75}
          distort={0.35}
          speed={1.5}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

function InnerGlow() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.2;
      const scale = 1 + Math.sin(clock.getElapsedTime() * 0.6) * 0.06;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Float speed={2} floatIntensity={0.4}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 24, 24]} />
        <MeshDistortMaterial
          color="#7c3aed"
          emissive="#6d28d9"
          emissiveIntensity={0.5}
          roughness={0.15}
          metalness={0.85}
          distort={0.4}
          speed={2}
          transparent
          opacity={0.5}
        />
      </mesh>
    </Float>
  );
}

function OrbitalRing({ radius, speed, color }: { radius: number; speed: number; color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(clock.getElapsedTime() * 0.25) * 0.25;
      ringRef.current.rotation.z = clock.getElapsedTime() * speed;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.015, 12, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.25} />
    </mesh>
  );
}

function Particles({ count = 30 }: { count?: number }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 2.5 + Math.random() * 1.5;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.04;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#818cf8" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function FloatingGradientSphere({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#3b82f6" />
        <pointLight position={[-5, -5, 5]} intensity={0.4} color="#06b6d4" />
        <pointLight position={[0, -3, 3]} intensity={0.3} color="#a855f7" />

        <GradientSphere />
        <InnerGlow />
        <OrbitalRing radius={2.5} speed={0.25} color="#6366f1" />
        <OrbitalRing radius={3} speed={-0.15} color="#a855f7" />
        <Particles count={25} />
      </Canvas>
    </div>
  );
}
