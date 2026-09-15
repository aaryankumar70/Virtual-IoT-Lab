import { Line } from '@react-three/drei';
import type { Wire3DProps } from './types';

export function Wire3D({ wire, start, end, active, selected, onSelect }: Wire3DProps) {
  const midX = (start[0] + end[0]) / 2;
  const points: [number, number, number][] = [
    start,
    [midX, Math.max(start[1], end[1]) + 0.18, start[2]],
    [midX, Math.max(start[1], end[1]) + 0.18, end[2]],
    end,
  ];
  return (
    <Line
      points={points}
      color={selected ? '#7048a2' : active ? '#e4a52b' : wire.signal === 'power' ? '#c06b58' : '#168988'}
      lineWidth={selected ? 4 : active ? 3 : 2.2}
      dashed={active}
      dashSize={0.24}
      gapSize={0.16}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    />
  );
}