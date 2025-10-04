"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook per gestire i dati del peso
 * Pattern GoF: Observer - notifica i componenti quando i dati cambiano
 * Pattern GRASP: Controller - coordina le operazioni sui dati peso
 *
 * @param {string} userId - ID dell'utente di cui caricare i dati peso
 * @returns {object} Oggetto con weightEntries, loading, error, refetch
 */
export function useWeightData(userId) {
  const [weightEntries, setWeightEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeightData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/weight/get?userId=${userId}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      setWeightEntries(data);
    } catch (err) {
      console.error("Error fetching weight data:", err);
      setError(err.message || "Errore nel caricamento dei dati");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWeightData();
  }, [fetchWeightData]);

  // Funzione per ricaricare i dati
  const refetch = useCallback(() => {
    fetchWeightData();
  }, [fetchWeightData]);

  // Calcola statistiche per periodo
  const getStatsByPeriod = useCallback(
    (period = "month") => {
      if (weightEntries.length === 0) {
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

      const weights = periodEntries.map((e) => parseFloat(e.weight));
      const average = weights.reduce((a, b) => a + b, 0) / weights.length;
      const min = Math.min(...weights);
      const max = Math.max(...weights);

      // Ordina per data
      const sorted = [...periodEntries].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      const firstWeight = parseFloat(sorted[0].weight);
      const lastWeight = parseFloat(sorted[sorted.length - 1].weight);
      const trend = lastWeight - firstWeight;

      return {
        average: average.toFixed(1),
        min: min.toFixed(1),
        max: max.toFixed(1),
        trend: trend.toFixed(1),
        entries: periodEntries.length,
      };
    },
    [weightEntries]
  );

  // Ottieni ultima misurazione
  const getLatestWeight = useCallback(() => {
    if (weightEntries.length === 0) return null;

    const sorted = [...weightEntries].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return {
      weight: parseFloat(sorted[0].weight).toFixed(1),
      date: new Date(sorted[0].date).toLocaleDateString("it-IT"),
    };
  }, [weightEntries]);

  return {
    weightEntries,
    isLoading,
    error,
    refetch,
    getStatsByPeriod,
    getLatestWeight,
  };
}
