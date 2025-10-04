"use client";

import { Card } from "@/components/ui/Card";

/**
 * Card informativa generica per la dashboard utente
 * Pattern GRASP: Low Coupling - componente riutilizzabile senza dipendenze specifiche
 * @param {string} title - Titolo della card
 * @param {React.ReactNode} icon - Icona da mostrare
 * @param {React.ReactNode} children - Contenuto della card
 */
export function InfoCard({ title, icon, children }) {
  return (
    <Card>
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <div className="text-muted-foreground">{children}</div>
      </div>
    </Card>
  );
}
