export function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  disabled = false,
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    warning: "bg-chart-4 text-white hover:bg-chart-4/90",
    outline:
      "border border-border bg-transparent hover:bg-muted text-foreground",
    ghost: "hover:bg-muted text-foreground",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
      {children}
    </button>
  );
}
