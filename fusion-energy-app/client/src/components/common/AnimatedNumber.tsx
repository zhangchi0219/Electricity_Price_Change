import { useEffect, useState, useRef } from 'react';
import { useInView } from '../../hooks/useInView';

interface Props {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function AnimatedNumber({
  value,
  duration = 1200,
  decimals = 0,
  suffix = '',
  prefix = '',
  className,
}: Props) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [current, setCurrent] = useState(0);
  const startTime = useRef<number | null>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!inView) return;

    const animate = (ts: number) => {
      if (startTime.current === null) startTime.current = ts;
      const elapsed = ts - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      setCurrent(eased * value);
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };

    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {current.toFixed(decimals)}
      {suffix}
    </span>
  );
}
