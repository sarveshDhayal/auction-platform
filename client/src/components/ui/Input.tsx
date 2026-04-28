import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LucideIcon } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "glass-input w-full",
            Icon ? "pl-11" : "pl-4", // Explicitly set left padding when icon exists
            "pr-4", // Ensure right padding is consistent
            error && "border-danger/50 focus:border-danger focus:ring-danger/50",
            className as string
          )}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-danger mt-1">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
