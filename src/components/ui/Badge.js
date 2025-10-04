export function Badge({ children, variant = "default", icon: Icon }) {
  const variants = {
    default: "bg-muted text-muted-foreground",
    success: "bg-chart-3/20 text-chart-3",
    error: "bg-destructive/20 text-destructive",
    warning: "bg-chart-4/20 text-chart-4",
    info: "bg-primary/20 text-primary",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
