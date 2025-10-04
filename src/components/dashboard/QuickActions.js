"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Componente per azioni rapide nella dashboard
 * Pattern GRASP: Low Coupling - riceve actions come props invece di dipendere da routing interno
 */
export function QuickActions({ actions = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Azioni Rapide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={action.onClick}
            icon={action.icon}
            variant={action.variant || "primary"}
            className="w-full py-4"
          >
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
