import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  isLoading,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none rounded-xl";

  const variants = {
    primary: "bg-primary text-white hover:bg-blue-600 focus:ring-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]",
    secondary: "bg-secondary text-white hover:bg-purple-600 focus:ring-secondary shadow-[0_0_15px_rgba(139,92,246,0.5)]",
    outline: "border border-white/20 hover:bg-white/10 text-white",
    ghost: "hover:bg-white/10 text-text-secondary hover:text-white",
    danger: "bg-danger text-white hover:bg-red-600 focus:ring-danger shadow-[0_0_15px_rgba(239,68,68,0.5)]",
    success: "bg-success text-white hover:bg-emerald-600 focus:ring-success shadow-[0_0_15px_rgba(16,185,129,0.5)]"
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
