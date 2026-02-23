import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 4000;

function Particles() {
  const meshRef = useRef<THREE.Points>(null);
  const { mouse } = useThree();

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    const colorA = new THREE.Color('#3B82F6'); // blue
    const colorB = new THREE.Color('#FFFFFF'); // white
    const colorC = new THREE.Color('#F59E0B'); // amber

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Random sphere distribution
      const r = Math.random() * 12 + 1;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Temperature gradient: closer to center = hotter (white/amber), farther = blue
      const t = 1 - Math.min(r / 12, 1);
      const col = t > 0.6
        ? colorC.clone().lerp(colorB, (t - 0.6) / 0.4)
        : colorB.clone().lerp(colorA, (0.6 - t) / 0.6);

      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = Math.random() * 2 + 0.5;
    }

    return { positions, colors, sizes };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Gentle rotation
    meshRef.current.rotation.y = t * 0.05;
    meshRef.current.rotation.x = Math.sin(t * 0.03) * 0.1;

    // Mouse influence on position
    const pos = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const original = positions;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const x = original[ix];
      const y = original[ix + 1];
      const z = original[ix + 2];

      const dist = Math.sqrt(x * x + y * y + z * z);
      const mouseInfluence = 0.3;

      pos.setXYZ(
        i,
        x + mouse.x * mouseInfluence * (1 / dist),
        y + mouse.y * mouseInfluence * (1 / dist),
        z + Math.sin(t * 0.5 + i * 0.01) * 0.02
      );
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={sizes}
          count={PARTICLE_COUNT}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ fov: 60, position: [0, 0, 15] }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
    >
      <Particles />
      <ambientLight intensity={0.5} />
    </Canvas>
  );
}
