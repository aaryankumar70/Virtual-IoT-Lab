import { useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { Pin3DType } from '../lib/component-registry';

export function Pin3D({
  position,
  type,
  active,
  onSelect,
}: {
  position: [number, number, number];
  type: Pin3DType;
  active: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect();
  };
  return (
    <mesh
      position={position}
      onClick={handleClick}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[active || hovered ? 0.105 : 0.075, 12, 8]} />
      <meshStandardMaterial
        color={active || hovered ? '#e3a62f' : type === 'power' ? '#c06b58' : '#168988'}
        emissive={active || hovered ? '#e3a62f' : '#000000'}
        emissiveIntensity={active || hovered ? 0.35 : 0}
      />
    </mesh>
  );
}