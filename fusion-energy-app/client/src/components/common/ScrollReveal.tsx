import { motion } from 'framer-motion';
import { useInView } from '../../hooks/useInView';

interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'fade';
}

export default function ScrollReveal({ children, delay = 0, className, direction = 'up' }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <motion.div
      ref={ref}
      initial={direction === 'up' ? { opacity: 0, y: 30 } : { opacity: 0 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
