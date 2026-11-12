
import { forwardRef } from "react";

const variants = {
  primary:
    "bg-brand text-white hover:bg-brand-hover",
  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200",
  outline:
    "border border-outline bg-transparent text-slate-900 hover:bg-slate-50",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100",
  danger:
    "bg-red-600 text-white hover:bg-red-700",
};

const sizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3 text-lg",
};

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    type = "button",
    disabled = false,
    className = "",
    ...props
  },
  ref
) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50";

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
