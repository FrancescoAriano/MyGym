"use client";

export function StatsCard({
  title,
  value,
  icon: Icon,
  color = "primary",
  onClick,
}) {
  const colorStyles = {
    primary: "bg-primary/10 text-primary",
    success: "bg-chart-3/20 text-chart-3",
    warning: "bg-chart-4/20 text-chart-4",
    info: "bg-chart-2/20 text-chart-2",
    danger: "bg-destructive/10 text-destructive",
  };

  return (
    <div
      className={`bg-card rounded-2xl p-6 shadow-md hover:scale-105 transition-transform duration-300 ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
        </div>
        {Icon && (
          <div
            className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorStyles[color]}`}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
