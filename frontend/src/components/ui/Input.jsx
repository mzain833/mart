
import { forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    id,
    type = "text",
    className = "",
    ...props
  },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-slate-700"
        >
          {label}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${inputId}-error` : undefined
        }
        className={`
          w-full rounded-control border bg-white px-4 py-3
          text-sm text-slate-900 placeholder:text-slate-400
          transition-colors duration-200
          focus:border-brand focus:outline-none focus:ring-2
          focus:ring-brand/20
          ${error ? "border-red-500" : "border-outline"}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-xs text-red-600"
        >
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
