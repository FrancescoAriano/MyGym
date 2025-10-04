"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HiFire, HiArrowRight } from "react-icons/hi2";

/**
 * Card per visualizzare i piani di allenamento (placeholder futuro)
 * Pattern GRASP: High Cohesion - gestisce solo la visualizzazione workout plans
 */
export function WorkoutPlanCard() {
  return (
    <Card>
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <HiFire className="h-5 w-5 text-primary" />I tuoi Allenamenti
        </h3>

        <div className="space-y-3">
          <p className="text-muted-foreground">
            Questa sezione conterrà i tuoi piani di allenamento personalizzati.
          </p>

          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-2">
              Funzionalità in arrivo:
            </p>
            <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
              <li>Visualizzazione schede allenamento</li>
              <li>Tracciamento progressi</li>
              <li>Calendario sessioni</li>
              <li>Statistiche personali</li>
            </ul>
          </div>
        </div>

        <Button variant="outline" disabled className="w-full">
          Visualizza Allenamenti
          <HiArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
}
