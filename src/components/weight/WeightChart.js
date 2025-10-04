"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  LineChart as RechartsLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HiChartBar } from "react-icons/hi2";

/**
 * Grafico per visualizzare l'andamento del peso nel tempo
 * Pattern GRASP: Information Expert - gestisce la visualizzazione del trend peso
 * @param {object[]} weightEntries - Array di misurazioni peso
 * @param {string} period - Periodo da visualizzare: 'week' | 'month' | 'year' | 'all'
 */
export function WeightChart({ weightEntries = [], period = "month" }) {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filterDataByPeriod = () => {
    if (!weightEntries || weightEntries.length === 0) return [];

    const now = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
        return weightEntries
          .map((entry) => ({
            date: new Date(entry.date).toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "2-digit",
            }),
            weight: parseFloat(entry.weight),
            fullDate: new Date(entry.date),
          }))
          .sort((a, b) => a.fullDate - b.fullDate);
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return weightEntries
      .filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= now;
      })
      .map((entry) => ({
        date: new Date(entry.date).toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "2-digit",
        }),
        weight: parseFloat(entry.weight),
        fullDate: new Date(entry.date),
      }))
      .sort((a, b) => a.fullDate - b.fullDate);
  };

  const chartData = filterDataByPeriod();

  const calculateAverage = () => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, item) => acc + item.weight, 0);
    return (sum / chartData.length).toFixed(1);
  };

  const average = calculateAverage();

  if (!isMounted) {
    return (
      <Card>
        <div className="p-6">
          <div style={{ width: "100%", height: 350 }} />
        </div>
      </Card>
    );
  }

  const isDark = theme === "dark";

  const periodButtons = [
    { value: "week", label: "7gg" },
    { value: "month", label: "1m" },
    { value: "year", label: "1a" },
    { value: "all", label: "Tutto" },
  ];

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <HiChartBar className="h-5 w-5 text-primary" />
            Andamento Peso
          </h3>

          <div className="flex gap-2">
            {periodButtons.map((btn) => (
              <Button
                key={btn.value}
                variant={selectedPeriod === btn.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(btn.value)}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">
              Nessun dato disponibile per il periodo selezionato
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLine
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#374151" : "#e5e7eb"}
              />
              <XAxis
                dataKey="date"
                stroke={isDark ? "#9ca3af" : "#6b7280"}
                style={{ fontSize: "0.75rem" }}
              />
              <YAxis
                stroke={isDark ? "#9ca3af" : "#6b7280"}
                style={{ fontSize: "0.875rem" }}
                domain={["dataMin - 2", "dataMax + 2"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value) => [`${value} kg`, "Peso"]}
              />
              <ReferenceLine
                y={average}
                stroke="hsl(var(--primary))"
                strokeDasharray="5 5"
                label={{
                  value: `Media: ${average} kg`,
                  position: "insideTopRight",
                  fill: "hsl(var(--primary))",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </RechartsLine>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
