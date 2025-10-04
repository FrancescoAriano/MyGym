"use client";

import { useState } from "react";

/**
 * Componente per selezionare il tipo di entità (User/Gym)
 * Pattern GRASP: Information Expert - gestisce la propria UI e stato
 */
export function EntityTypeSelector({ value, onChange }) {
  return (
    <div className="flex p-2 space-x-2 bg-muted/50 rounded-xl">
      <button
        type="button"
        onClick={() => onChange("user")}
        className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
          value === "user"
            ? "bg-background text-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Sono un Utente
      </button>
      <button
        type="button"
        onClick={() => onChange("gym")}
        className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
          value === "gym"
            ? "bg-background text-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Sono una Palestra
      </button>
    </div>
  );
}

/**
 * Componente per messaggi di errore e successo
 * Pattern GRASP: High Cohesion - si occupa solo di visualizzare messaggi
 */
export function AlertMessage({ message, type = "error" }) {
  if (!message) return null;

  const styles = {
    error: "bg-destructive/10 border-destructive/20 text-destructive",
    success: "bg-chart-3/10 border-chart-3/20 text-chart-3",
    warning: "bg-chart-4/10 border-chart-4/20 text-chart-4",
    info: "bg-chart-2/10 border-chart-2/20 text-chart-2",
  };

  return (
    <div className={`p-3 rounded-lg border ${styles[type]}`}>
      <p className="text-sm">{message}</p>
    </div>
  );
}

/**
 * Hook personalizzato per gestire form
 * Pattern GRASP: Controller - coordina le operazioni del form
 */
export function useFormState(initialState = {}) {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(""); // Clear error on input change
  };

  const reset = () => {
    setFormData(initialState);
    setError("");
    setSuccess("");
    setIsLoading(false);
  };

  return {
    formData,
    setFormData,
    error,
    setError,
    success,
    setSuccess,
    isLoading,
    setIsLoading,
    handleChange,
    reset,
  };
}
