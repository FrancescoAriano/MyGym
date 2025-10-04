"use client";

import { MembershipChart, PieChart, BarChart } from "@/components/charts";

/**
 * Factory per creare grafici
 * Pattern GoF: Factory Method - crea grafici basandosi su tipo e dati
 * Facilita la creazione di grafici senza conoscere i dettagli di implementazione
 */
export class ChartFactory {
  /**
   * Crea un grafico per l'andamento degli iscritti
   */
  static createMembershipTrendChart(members) {
    const monthNames = [
      "Gen",
      "Feb",
      "Mar",
      "Apr",
      "Mag",
      "Giu",
      "Lug",
      "Ago",
      "Set",
      "Ott",
      "Nov",
      "Dic",
    ];

    const membersByMonth = members.reduce((acc, m) => {
      if (!m.startDate) return acc;
      const date = new Date(m.startDate);
      const month = date.getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const membershipTrend = monthNames.map((name, idx) => ({
      month: name,
      members: membersByMonth[idx] || 0,
    }));

    return { type: "membership", data: membershipTrend };
  }

  /**
   * Crea un grafico a torta per la distribuzione dei membri per abbonamento
   */
  static createMemberDistributionChart(members, subscriptions) {
    const data = subscriptions
      .filter((s) => s.isActive)
      .map((sub) => ({
        name: sub.name,
        value: members.filter((m) => m.subscriptionTypeId === sub.id).length,
      }));

    return { type: "pie", data, title: "Distribuzione Membri" };
  }

  /**
   * Crea un grafico a barre per le entrate potenziali
   */
  static createRevenueChart(members, subscriptions) {
    const data = subscriptions
      .filter((s) => s.isActive)
      .map((sub) => ({
        name: sub.name,
        revenue:
          members.filter((m) => m.subscriptionTypeId === sub.id).length *
          Number.parseFloat(sub.price),
      }));

    return {
      type: "bar",
      data,
      title: "Entrate Potenziali",
      dataKeyX: "name",
      dataKeyY: "revenue",
    };
  }

  /**
   * Renderizza il grafico appropriato basandosi sul tipo
   */
  static render(chartConfig) {
    switch (chartConfig.type) {
      case "membership":
        return <MembershipChart membershipTrend={chartConfig.data} />;
      case "pie":
        return (
          <PieChart
            data={chartConfig.data}
            title={chartConfig.title}
            dataKey={chartConfig.dataKey || "value"}
          />
        );
      case "bar":
        return (
          <BarChart
            data={chartConfig.data}
            title={chartConfig.title}
            dataKeyX={chartConfig.dataKeyX}
            dataKeyY={chartConfig.dataKeyY}
          />
        );
      default:
        return null;
    }
  }
}
