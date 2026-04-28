import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { clsx } from 'clsx';

const Countdown = ({ targetDate, onEnd }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { d: 0, h: 0, m: 0, s: 0 };
    }
    return { timeLeft, difference };
  };

  const [time, setTime] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTime = calculateTimeLeft();
      setTime(newTime);
      
      if (newTime.difference <= 0) {
        onEnd?.();
      }
    }, 1000);

    return () => clearTimeout(timer);
  });

  const { d, h, m, s } = time.timeLeft;
  const isUrgent = time.difference > 0 && time.difference < 60000; // Less than 1 minute

  const timeBlocks = [
    { label: 'Days', value: d },
    { label: 'Hours', value: h },
    { label: 'Mins', value: m },
    { label: 'Secs', value: s },
  ];

  return (
    <div className={clsx(
      "flex flex-col items-center p-4 rounded-xl border transition-colors duration-500",
      isUrgent ? "bg-danger/10 border-danger/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]" : "bg-white/5 border-white/10"
    )}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className={clsx("w-5 h-5", isUrgent ? "text-danger animate-pulse" : "text-primary")} />
        <span className={clsx("text-sm font-semibold uppercase tracking-wider", isUrgent ? "text-danger" : "text-text-secondary")}>
          {isUrgent ? 'Ending Soon!' : 'Time Remaining'}
        </span>
      </div>

      <div className="flex gap-3">
        {timeBlocks.map((block, i) => (
          <div key={block.label} className="flex flex-col items-center">
            <div className={clsx(
              "w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-bold font-mono border",
              isUrgent ? "bg-danger/20 border-danger/30 text-danger" : "bg-background border-white/10 text-white"
            )}>
              <motion.span
                key={block.value}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {block.value.toString().padStart(2, '0')}
              </motion.span>
            </div>
            <span className="text-[10px] uppercase text-text-secondary mt-1 font-medium">{block.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Countdown;
