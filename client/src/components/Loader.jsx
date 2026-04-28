import { motion } from 'framer-motion';

const Loader = ({ fullScreen = false }) => {
  const containerClass = fullScreen 
    ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    : "flex items-center justify-center p-8 w-full";

  return (
    <div className={containerClass}>
      <div className="relative w-16 h-16">
        <motion.span
          className="absolute inset-0 rounded-full border-t-2 border-primary border-r-2 border-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          className="absolute inset-2 rounded-full border-t-2 border-secondary border-l-2 border-transparent"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          className="absolute inset-4 rounded-full border-t-2 border-success border-b-2 border-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
};

export default Loader;
