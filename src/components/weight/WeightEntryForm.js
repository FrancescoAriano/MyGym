"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { HiScale, HiCalendar } from "react-icons/hi2";

/**
 * Form per aggiungere/aggiornare una misurazione del peso
 * Pattern GRASP: High Cohesion - gestisce solo l'inserimento peso
 * @param {function} onSuccess - Callback dopo inserimento riuscito
 */
export function WeightEntryForm({ onSuccess }) {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!weight || parseFloat(weight) <= 0) {
      setToast({
        type: "error",
        message: "Inserisci un peso valido",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/weight/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(weight),
          date: date,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setToast({
        type: "success",
        message: "Peso registrato con successo!",
      });

      setWeight("");
      setDate(new Date().toISOString().split("T")[0]);

      if (onSuccess) onSuccess();
    } catch (error) {
      setToast({
        type: "error",
        message: error.message || "Errore durante il salvataggio",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <HiScale className="h-5 w-5 text-primary" />
            Registra Peso
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Peso (kg)
              </label>
              <Input
                type="number"
                step="0.1"
                min="1"
                max="500"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Es: 75.5"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-foreground mb-2">
                <HiCalendar className="h-4 w-4" />
                Data
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Salvataggio..." : "Salva Peso"}
            </Button>
          </form>
        </div>
      </Card>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
