import { motion } from 'framer-motion';
import { useInView } from '../../hooks/useInView';

interface Props {
  value: number; // 0-1
  color?: string;
  label?: string;
  showPct?: boolean;
}

export default function BarChart({ value, color = '#3B82F6', label, showPct = true }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className="w-full">
      {label && (
        <div className="flex justify-between mb-1 text-xs text-gray-500">
          <span>{label}</span>
          {showPct && <span>{Math.round(value * 100)}%</span>}
        </div>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${value * 100}%` } : {}}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
