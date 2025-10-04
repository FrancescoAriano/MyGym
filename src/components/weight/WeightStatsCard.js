"use client";

import { Card } from "@/components/ui/Card";
import { HiChartBar, HiTrendingUp, HiTrendingDown } from "react-icons/hi2";

/**
 * Card per visualizzare statistiche sul peso (medie settimanali/mensili/annuali)
 * Pattern GRASP: Information Expert - gestisce il calcolo e visualizzazione statistiche
 * @param {object[]} weightEntries - Array di misurazioni peso
 * @param {string} period - Periodo da visualizzare: 'week' | 'month' | 'year'
 */
export function WeightStatsCard({ weightEntries = [], period = "month" }) {
  const calculateStats = () => {
    if (!weightEntries || weightEntries.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        trend: 0,
        entries: 0,
      };
    }

    const now = new Date();
    let startDate = new Date();

    // Definisci la data di inizio in base al periodo
    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Filtra entries per il periodo
    const periodEntries = weightEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= now;
    });

    if (periodEntries.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        trend: 0,
        entries: 0,
      };
    }

    // Calcola statistiche
    const weights = periodEntries.map((e) => parseFloat(e.weight));
    const average = weights.reduce((a, b) => a + b, 0) / weights.length;
    const min = Math.min(...weights);
    const max = Math.max(...weights);

    // Calcola trend (differenza tra primo e ultimo peso)
    const firstWeight = parseFloat(periodEntries[0].weight);
    const lastWeight = parseFloat(
      periodEntries[periodEntries.length - 1].weight
    );
    const trend = lastWeight - firstWeight;

    return {
      average: average.toFixed(1),
      min: min.toFixed(1),
      max: max.toFixed(1),
      trend: trend.toFixed(1),
      entries: periodEntries.length,
    };
  };

  const stats = calculateStats();

  const periodLabels = {
    week: "Settimana",
    month: "Mese",
    year: "Anno",
  };

  const getTrendColor = () => {
    if (stats.trend > 0) return "text-warning";
    if (stats.trend < 0) return "text-success";
    return "text-muted-foreground";
  };

  const getTrendIcon = () => {
    if (stats.trend > 0) return <HiTrendingUp className="h-5 w-5" />;
    if (stats.trend < 0) return <HiTrendingDown className="h-5 w-5" />;
    return null;
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <HiChartBar className="h-5 w-5 text-primary" />
          Statistiche {periodLabels[period]}
        </h3>

        {stats.entries === 0 ? (
          <p className="text-muted-foreground">
            Nessuna misurazione nel periodo selezionato.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Media</p>
              <p className="text-2xl font-bold text-primary">
                {stats.average} kg
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Misurazioni</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.entries}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Minimo</p>
              <p className="text-lg font-semibold text-foreground">
                {stats.min} kg
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Massimo</p>
              <p className="text-lg font-semibold text-foreground">
                {stats.max} kg
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Variazione</p>
              <p
                className={`text-xl font-bold flex items-center gap-2 ${getTrendColor()}`}
              >
                {getTrendIcon()}
                {stats.trend > 0 ? "+" : ""}
                {stats.trend} kg
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
