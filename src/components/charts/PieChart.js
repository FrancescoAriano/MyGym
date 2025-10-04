"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { HiChartBar } from "react-icons/hi2";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

/**
 * Componente riutilizzabile per grafici a torta
 * @param {object[]} data - Array di dati da visualizzare. Es: [{ name: 'Mensile', value: 10 }]
 * @param {string} title - Titolo del grafico
 * @param {string} dataKey - Chiave per il valore dei dati (default: 'value')
 * @param {boolean} showPercentage - Mostra percentuale nelle etichette (default: true)
 */
export function PieChart({
  data,
  title = "Grafico a Torta",
  dataKey = "value",
  showPercentage = true,
}) {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-md">
        <div style={{ width: "100%", height: 300 }} />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-md hover:scale-105 transition-transform duration-300">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <HiChartBar className="h-5 w-5 text-primary" />
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={
              showPercentage
                ? ({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                : ({ name }) => name
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
          />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}
