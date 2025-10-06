"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook per ottenere i dati dell'abbonamento dell'utente
 * Pattern GoF: Observer - notifica i componenti quando i dati cambiano
 *
 * @returns {object} Oggetto con membership, loading, error, refetch
 */
export function useMembershipData() {
  const [membership, setMembership] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembership = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/membership");

      if (response.status === 404) {
        // Nessun abbonamento trovato
        setMembership(null);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Impossibile caricare i dati abbonamento");
      }

      const data = await response.json();
      setMembership(data);
    } catch (err) {
      console.error("Error fetching membership:", err);
      setError(err.message || "Errore nel caricamento dei dati");
      setMembership(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  // Funzione per ricaricare i dati
  const refetch = useCallback(() => {
    fetchMembership();
  }, [fetchMembership]);

  return {
    membership,
    isLoading,
    error,
    refetch,
  };
}
