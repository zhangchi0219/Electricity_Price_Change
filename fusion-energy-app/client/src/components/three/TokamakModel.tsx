import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const PLASMA_COUNT = 500;
const COIL_COUNT = 12;

function PlasmaParticles() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(PLASMA_COUNT * 3);
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < PLASMA_COUNT; i++) {
      const offset = (i / PLASMA_COUNT) * Math.PI * 2;
      const speed = 0.5;
      const angle = t * speed + offset;
      const R = 3; // major radius
      const r = 0.6; // minor radius (inside tube)
      const innerAngle = angle * 3; // how fast particle rotates around the tube

      pos.setXYZ(
        i,
        (R + r * Math.cos(innerAngle)) * Math.cos(angle),
        r * Math.sin(innerAngle),
        (R + r * Math.cos(innerAngle)) * Math.sin(angle)
      );
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={PLASMA_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#F59E0B"
        size={0.06}
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Coils() {
  return (
    <>
      {Array.from({ length: COIL_COUNT }, (_, i) => {
        const angle = (i / COIL_COUNT) * Math.PI * 2;
        const x = 3 * Math.cos(angle);
        const z = 3 * Math.sin(angle);

        return (
          <mesh key={i} position={[x, 0, z]} rotation={[0, -angle, 0]}>
            <torusGeometry args={[1.3, 0.04, 8, 32]} />
            <meshStandardMaterial
              color="#6B7280"
              wireframe={false}
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
        );
      })}
    </>
  );
}

function TokamakMesh() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main torus - plasma chamber */}
      <mesh>
        <torusGeometry args={[3, 1, 16, 64]} />
        <meshStandardMaterial
          color="#3B82F6"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
      {/* Solid torus with low opacity */}
      <mesh>
        <torusGeometry args={[3, 1, 16, 64]} />
        <meshStandardMaterial
          color="#1E3A5F"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Coils />
      <PlasmaParticles />
    </group>
  );
}

export default function TokamakModel() {
  return (
    <Canvas
      camera={{ fov: 50, position: [8, 4, 8] }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#3B82F6" />
      <pointLight position={[-10, -5, -5]} intensity={0.5} color="#8B5CF6" />
      <TokamakMesh />
      <OrbitControls enablePan={false} minDistance={5} maxDistance={20} />
    </Canvas>
  );
}
