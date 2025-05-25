import React from "react";

// Simple utility for class merging
function cn(...args) {
  return args.filter(Boolean).join(" ");
}

const sizes = {
  default: "h-10 px-4 py-2 text-base",
  sm: "h-9 px-3 text-sm",
  lg: "h-11 px-8 text-lg",
  icon: "h-10 w-10 p-0 flex items-center justify-center",
};

const variants = {
  default: "bg-primary text-white hover:bg-primary/90",
  outline: "border border-primary bg-transparent text-primary hover:bg-primary/10",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline underline-offset-4 hover:text-primary/80",
};

export const Button = React.forwardRef(
  (
    {
      className = "",
      variant = "default",
      size = "default",
      type = "button",
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        sizes[size] || sizes.default,
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = "Button";