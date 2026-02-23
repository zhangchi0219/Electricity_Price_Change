interface Props {
  level: number; // 1-5
  color?: string;
}

export default function ImpactMeter({ level, color = '#3B82F6' }: Props) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="impact-dot transition-opacity duration-200"
          style={{
            backgroundColor: i < level ? color : 'transparent',
            border: `1.5px solid ${color}`,
            opacity: i < level ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}
