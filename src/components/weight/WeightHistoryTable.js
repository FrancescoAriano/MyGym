"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { HiCalendar, HiScale } from "react-icons/hi2";

/**
 * Tabella per visualizzare lo storico delle misurazioni peso
 * Pattern GRASP: Information Expert - gestisce la visualizzazione cronologica
 * @param {object[]} weightEntries - Array di misurazioni peso
 * @param {number} limit - Numero massimo di entries da mostrare (default: 10)
 */
export function WeightHistoryTable({ weightEntries = [], limit = 10 }) {
  if (!weightEntries || weightEntries.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <HiScale className="h-5 w-5 text-primary" />
            Storico Misurazioni
          </h3>
          <p className="text-muted-foreground text-center py-8">
            Nessuna misurazione registrata
          </p>
        </div>
      </Card>
    );
  }

  // Ordina per data decrescente e limita
  const sortedEntries = [...weightEntries]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);

  // Calcola variazione rispetto alla misurazione precedente
  const getWeightChange = (index) => {
    if (index === sortedEntries.length - 1) return null;
    const current = parseFloat(sortedEntries[index].weight);
    const previous = parseFloat(sortedEntries[index + 1].weight);
    const change = current - previous;
    return change.toFixed(1);
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <HiScale className="h-5 w-5 text-primary" />
          Storico Misurazioni
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-semibold text-foreground">
                  Data
                </th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-foreground">
                  Peso
                </th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-foreground">
                  Variazione
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry, index) => {
                const change = getWeightChange(index);
                const changeColor =
                  change === null
                    ? ""
                    : parseFloat(change) > 0
                    ? "text-warning"
                    : parseFloat(change) < 0
                    ? "text-success"
                    : "text-muted-foreground";

                return (
                  <tr
                    key={entry.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <HiCalendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(entry.date).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-lg font-semibold text-foreground">
                        {parseFloat(entry.weight).toFixed(1)} kg
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {change !== null ? (
                        <Badge
                          variant={
                            parseFloat(change) > 0
                              ? "warning"
                              : parseFloat(change) < 0
                              ? "success"
                              : "default"
                          }
                        >
                          {parseFloat(change) > 0 ? "+" : ""}
                          {change} kg
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {weightEntries.length > limit && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            Mostrate {limit} di {weightEntries.length} misurazioni
          </p>
        )}
      </div>
    </Card>
  );
}
