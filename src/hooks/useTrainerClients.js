"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook per gestire i clienti delle palestre dove il trainer lavora
 * Pattern GoF: Observer - notifica i componenti quando i dati cambiano
 * Pattern GRASP: Controller - coordina le operazioni sui dati clienti trainer
 *
 * @returns {object} Oggetto con clients, gyms, loading, error, refetch
 */
export function useTrainerClients() {
  const [clients, setClients] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrainerData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch delle palestre dove il trainer lavora
      const gymsResponse = await fetch("/api/trainer/gyms");

      if (!gymsResponse.ok) {
        throw new Error("Impossibile caricare le palestre");
      }

      const gymsData = await gymsResponse.json();
      setGyms(gymsData);

      // Fetch dei clienti di tutte le palestre
      const clientsResponse = await fetch("/api/trainer/clients");

      if (!clientsResponse.ok) {
        throw new Error("Impossibile caricare i clienti");
      }

      const clientsData = await clientsResponse.json();
      setClients(clientsData);
    } catch (err) {
      console.error("Error fetching trainer data:", err);
      setError(err.message || "Errore nel caricamento dei dati");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainerData();
  }, [fetchTrainerData]);

  // Funzione per ricaricare i dati
  const refetch = useCallback(() => {
    fetchTrainerData();
  }, [fetchTrainerData]);

  // Filtra clienti per palestra
  const getClientsByGym = useCallback(
    (gymId) => {
      return clients.filter((client) => client.gymId === gymId);
    },
    [clients]
  );

  // Conta clienti per palestra
  const getClientsCountByGym = useCallback(() => {
    return gyms.map((gym) => ({
      ...gym,
      clientsCount: clients.filter((c) => c.gymId === gym.id).length,
    }));
  }, [gyms, clients]);

  return {
    clients,
    gyms,
    isLoading,
    error,
    refetch,
    getClientsByGym,
    getClientsCountByGym,
  };
}
