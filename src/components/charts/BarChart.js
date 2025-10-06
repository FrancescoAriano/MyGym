"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { HiChartBar } from "react-icons/hi2";

/**
 * Componente riutilizzabile per grafici a barre
 * @param {object[]} data - Array di dati da visualizzare
 * @param {string} title - Titolo del grafico
 * @param {string} dataKeyX - Chiave per i valori dell'asse X
 * @param {string} dataKeyY - Chiave per i valori dell'asse Y
 * @param {string} color - Colore delle barre (default: chart-2)
 */
export function BarChart({
  data,
  title = "Grafico a Barre",
  dataKeyX = "name",
  dataKeyY = "value",
  color = "hsl(var(--chart-2))",
}) {
  const { theme } = useTheme();
  const [chartColors, setChartColors] = useState({
    foreground: "hsl(0 0% 9%)",
    mutedForeground: "hsl(0 0% 45%)",
    border: "hsl(0 0% 89%)",
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const computedStyles = window.getComputedStyle(document.documentElement);
      setChartColors({
        foreground: computedStyles.getPropertyValue("--foreground").trim(),
        mutedForeground: computedStyles
          .getPropertyValue("--muted-foreground")
          .trim(),
        border: computedStyles.getPropertyValue("--border").trim(),
      });
    }
  }, [theme]);

  if (!isMounted) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-md">
        <div style={{ width: "100%", height: 300 }} />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-md">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <HiChartBar className="h-5 w-5 text-primary" />
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBar data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
          <XAxis
            dataKey={dataKeyX}
            stroke={chartColors.mutedForeground}
            tick={{ fill: chartColors.mutedForeground }}
          />
          <Bar
            dataKey={dataKeyY}
            radius={[8, 8, 0, 0]}
            stroke="var(--primary)"
          />
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  );
}
