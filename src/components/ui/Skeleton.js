"use client";

/**
 * Componente Skeleton generico riutilizzabile
 * Pattern GRASP: Information Expert - conosce come renderizzarsi
 */
export function Skeleton({ className = "", variant = "default" }) {
  const variants = {
    default: "bg-muted",
    light: "bg-muted/50",
    card: "bg-card",
  };

  return (
    <div
      className={`animate-pulse rounded ${variants[variant]} ${className}`}
    />
  );
}

/**
 * Skeleton per Card di statistiche
 */
export function StatsCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Skeleton per grafici
 */
export function ChartSkeleton({ height = "300px" }) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-md">
      <Skeleton className="h-6 w-48 mb-4" />
      <Skeleton className="w-full" style={{ height }} />
    </div>
  );
}

/**
 * Skeleton per tabelle
 */
export function TableSkeleton({ rows = 5, columns = 6 }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-muted p-4">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton per Card generica
 */
export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton per griglia di card
 */
export function CardGridSkeleton({ items = 6, columns = 3 }) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-${columns}`}>
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} lines={3} />
      ))}
    </div>
  );
}

/**
 * Skeleton per dashboard completa
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Chart */}
      <ChartSkeleton />

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton lines={5} />
        <CardSkeleton lines={5} />
      </div>
    </div>
  );
}

/**
 * Skeleton per User Dashboard
 */
export function UserDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar Skeleton */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Skeleton className="h-6 w-40" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32 hidden sm:block" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="p-4 mx-auto max-w-7xl">
        <Skeleton className="h-9 w-64 mb-6" />
        <div className="grid gap-6 lg:grid-cols-2">
          <CardSkeleton lines={6} />
          <CardSkeleton lines={6} />
        </div>
      </main>
    </div>
  );
}
