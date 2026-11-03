import React, { forwardRef } from 'react';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, className = '', id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 mb-1.5">
            {label} {props.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`block w-full px-3 py-2 sm:text-sm rounded-xl border bg-white text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
          } ${props.disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''} ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';

