"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook per gestire i dati degli abbonamenti
 * Pattern GRASP: Information Expert - centralizza la logica degli abbonamenti
 * Pattern GoF: Observer - gestisce lo stato e notifica i componenti
 */
export function useSubscriptionsData() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/gym/subscription-type/protected/get");
      if (!response.ok)
        throw new Error("Errore nel caricamento degli abbonamenti");
      const data = await response.json();
      setSubscriptions(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Computed values
  const activeSubscriptions = subscriptions.filter((s) => s.isActive);
  const archivedSubscriptions = subscriptions.filter((s) => !s.isActive);

  return {
    subscriptions,
    activeSubscriptions,
    archivedSubscriptions,
    isLoading,
    error,
    refetch: fetchSubscriptions,
  };
}
