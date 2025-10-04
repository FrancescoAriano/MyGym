"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { HiChartBar } from "react-icons/hi";

/**
 * Un componente riutilizzabile per grafici a linea che si adatta al tema.
 * @param {object[]} data - L'array di dati da visualizzare. Es: [{ month: 'Gen', value: 100 }]
 * @param {string} title - Il titolo da mostrare sopra il grafico.
 * @param {string} dataKeyX - La chiave per il valore dell'asse X (es. 'month').
 * @param {string} dataKeyY - La chiave per il valore dell'asse Y (es. 'members').
 */
export function MembershipChart({ membershipTrend, title = "Grafico" }) {
  const { theme } = useTheme();
  const [chartColors, setChartColors] = useState({
    foreground: "hsl(0 0% 9%)",
    mutedForeground: "hsl(0 0% 45%)",
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
    <div className="bg-card rounded-2xl p-6 shadow-md hover:scale-105 transition-transform duration-300">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <HiChartBar className="h-5 w-5 text-primary" />
        Andamento Iscritti
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={membershipTrend}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartColors.mutedForeground} // <-- USA I COLORI DALLO STATE
          />
          <XAxis
            dataKey="month"
            stroke={chartColors.foreground} // <-- USA I COLORI DALLO STATE
            tick={{ fill: chartColors.mutedForeground, fontSize: 12 }} // Ho usato muted per i tick, è più leggibile
            padding={{ left: 16, right: 16 }}
            angle={-45}
            textAnchor="end"
            height={60} // Aumenta l'altezza per far spazio al testo inclinato
          />
          <Line
            type="monotone"
            dataKey="members"
            stroke="var(--primary)" // <-- Un altro modo: usare direttamente var() qui
            strokeWidth={2}
            name="Membri"
            dot={{
              stroke: "var(--primary)",
              fill: "var(--background)",
              strokeWidth: 2,
            }}
            activeDot={{
              fill: "var(--primary)",
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
