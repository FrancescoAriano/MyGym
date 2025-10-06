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
   * Raggruppa abbonamenti con lo stesso nome ma durate diverse
   */
  static createMemberDistributionChart(members, subscriptions) {
    // Raggruppa subscriptions per nome
    const groupedByName = {};

    subscriptions
      .filter((s) => s.isActive)
      .forEach((sub) => {
        if (!groupedByName[sub.name]) {
          groupedByName[sub.name] = [];
        }
        groupedByName[sub.name].push(sub.id);
      });

    // Conta i membri per ogni gruppo di abbonamenti
    const data = Object.entries(groupedByName).map(([name, subIds]) => ({
      name,
      value: members.filter((m) => subIds.includes(m.subscriptionTypeId))
        .length,
    }));

    return { type: "pie", data, title: "Distribuzione Membri" };
  }

  /**
   * Crea un grafico a barre per le entrate potenziali
   * Raggruppa abbonamenti con lo stesso nome ma durate diverse
   */
  static createRevenueChart(members, subscriptions) {
    // Raggruppa subscriptions per nome
    const groupedByName = {};

    subscriptions
      .filter((s) => s.isActive)
      .forEach((sub) => {
        if (!groupedByName[sub.name]) {
          groupedByName[sub.name] = {
            ids: [],
            prices: [],
          };
        }
        groupedByName[sub.name].ids.push(sub.id);
        groupedByName[sub.name].prices.push(Number.parseFloat(sub.price));
      });

    // Calcola le entrate per ogni gruppo
    const data = Object.entries(groupedByName).map(([name, group]) => {
      const membersInGroup = members.filter((m) =>
        group.ids.includes(m.subscriptionTypeId)
      );

      // Calcola le entrate totali per questo gruppo
      let totalRevenue = 0;
      membersInGroup.forEach((member) => {
        const subIndex = group.ids.indexOf(member.subscriptionTypeId);
        if (subIndex !== -1) {
          totalRevenue += group.prices[subIndex];
        }
      });

      return {
        name,
        revenue: totalRevenue,
      };
    });

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
