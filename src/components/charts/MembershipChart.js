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
} from "recharts";
import { HiChartBar } from "react-icons/hi2";

/**
 * Componente riutilizzabile per grafico andamento iscritti
 * Pattern GRASP: Information Expert - gestisce la visualizzazione dei dati trend
 * @param {object[]} membershipTrend - Array di dati mensili. Es: [{ month: 'Gen', members: 10 }]
 * @param {string} title - Titolo del grafico (default: 'Andamento Iscrizioni')
 */
export function MembershipChart({
  membershipTrend = [],
  title = "Andamento Iscrizioni",
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

  const isDark = theme === "dark";

  return (
    <div className="bg-card rounded-2xl p-6 shadow-md">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <HiChartBar className="h-5 w-5 text-primary" />
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLine
          data={membershipTrend}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "#374151" : "#e5e7eb"}
          />
          <XAxis
            dataKey="month"
            stroke={isDark ? "#9ca3af" : "#6b7280"}
            style={{ fontSize: "0.875rem" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              color: "hsl(var(--foreground))",
            }}
          />
          <Line
            type="monotone"
            dataKey="members"
            stroke="var(--primary)"
            strokeWidth={2}
            name="Membri"
            dot={{
              stroke: "var(--primary)",
              fill: "var(--background)",
              r: 4,
            }}
            activeDot={{ r: 6 }}
          />
        </RechartsLine>
      </ResponsiveContainer>
    </div>
  );
}
