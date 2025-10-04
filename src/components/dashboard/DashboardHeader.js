"use client";

/**
 * Componente per l'header delle pagine dashboard
 * Pattern GRASP: Information Expert - conosce come mostrare il suo contenuto
 */
export function DashboardHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
