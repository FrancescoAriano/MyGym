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

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }) => {
    const RADIAN = Math.PI / 180;
    // Calcola la posizione della label leggermente fuori dal grafico
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const radiusForLabel = outerRadius + 15; // Sposta la label più all'esterno
    const x = cx + radiusForLabel * Math.cos(-midAngle * RADIAN);
    const y = cy + radiusForLabel * Math.sin(-midAngle * RADIAN);

    const labelText = showPercentage // Usa la tua logica qui
      ? `${name} ${(percent * 100).toFixed(0)}%`
      : name;

    return (
      <text
        x={x}
        y={y}
        fill="var(--primary)" // <-- ECCO LA SOLUZIONE!
        textAnchor={x > cx ? "start" : "end"} // Allinea il testo correttamente
        dominantBaseline="central"
        fontSize={14} // Puoi aggiungere anche altre proprietà di stile
      >
        {labelText}
      </text>
    );
  };
  return (
    <div className="bg-card rounded-2xl p-6 shadow-md">
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
            label={renderCustomizedLabel}
            outerRadius={80}
            dataKey={dataKey}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}
