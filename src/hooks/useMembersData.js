"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook per gestire i dati dei membri
 * Pattern GRASP: Information Expert - centralizza la logica dei dati dei membri
 * Pattern GoF: Observer - gestisce lo stato e notifica i componenti
 */
export function useMembersData() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/gym/member/get");
      if (!response.ok) throw new Error("Errore nel caricamento dei membri");
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Computed values
  const activeMembers = members.filter((m) => m.status === "ACTIVE");
  const expiringMembers = members.filter((m) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(m.endDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  });

  return {
    members,
    activeMembers,
    expiringMembers,
    isLoading,
    error,
    refetch: fetchMembers,
  };
}
