interface Props {
  dark?: boolean;
  className?: string;
}

export default function GeometricDivider({ dark = false, className = '' }: Props) {
  const stroke = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <div className={`w-full overflow-hidden ${className}`} aria-hidden>
      <svg width="100%" height="24" viewBox="0 0 1200 24" preserveAspectRatio="none">
        {Array.from({ length: 20 }, (_, i) => (
          <line
            key={i}
            x1={i * 63}
            y1="0"
            x2={i * 63 + 30}
            y2="24"
            stroke={stroke}
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
}
