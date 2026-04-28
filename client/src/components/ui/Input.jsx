import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Input = forwardRef(({ className, label, error, icon: Icon, ...props }, ref) => {
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
            Icon && "pl-10",
            error && "border-danger/50 focus:border-danger focus:ring-danger/50",
            className
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
