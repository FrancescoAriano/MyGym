import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ModalFooter } from "@/components/ui/Modal";
import { formatPrice, formatDuration } from "@/lib/formatters";

export function AddMemberForm({ activeSubscriptions, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "CLIENT",
    subscriptionTypeId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  // Calcola automaticamente la data di fine abbonamento
  const calculateEndDate = useCallback(
    (subscriptionTypeId, startDate) => {
      const subscription = activeSubscriptions.find(
        (s) => s.id === subscriptionTypeId
      );
      if (!subscription || !startDate) return "";

      const start = new Date(startDate);
      const end = new Date(start);

      switch (subscription.durationUnit) {
        case "DAY":
          end.setDate(end.getDate() + subscription.durationValue);
          break;
        case "WEEK":
          end.setDate(end.getDate() + subscription.durationValue * 7);
          break;
        case "MONTH":
          end.setMonth(end.getMonth() + subscription.durationValue);
          break;
      }

      return end.toISOString().split("T")[0];
    },
    [activeSubscriptions]
  );

  // Aggiorna la data di fine quando cambia abbonamento o data di inizio
  useEffect(() => {
    if (formData.subscriptionTypeId && formData.startDate) {
      const endDate = calculateEndDate(
        formData.subscriptionTypeId,
        formData.startDate
      );
      setFormData((prev) => ({ ...prev, endDate }));
    }
  }, [formData.subscriptionTypeId, formData.startDate, calculateEndDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nome"
          type="text"
          value={formData.firstName}
          onChange={handleInputChange("firstName")}
          required
        />
        <Input
          label="Cognome"
          type="text"
          value={formData.lastName}
          onChange={handleInputChange("lastName")}
          required
        />
      </div>

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleInputChange("email")}
        required
      />

      <Select
        label="Ruolo"
        value={formData.role}
        onChange={handleSelectChange("role")}
        options={[
          { value: "CLIENT", label: "Cliente" },
          { value: "TRAINER", label: "Trainer" },
        ]}
      />

      <Select
        label={`Abbonamento ${
          formData.role === "TRAINER" ? "(Opzionale)" : ""
        }`}
        value={formData.subscriptionTypeId}
        onChange={handleSelectChange("subscriptionTypeId")}
        options={[
          ...(formData.role === "TRAINER"
            ? [{ value: "", label: "Nessuno" }]
            : []),
          ...activeSubscriptions.map((sub) => ({
            value: sub.id,
            label: `${sub.name} - ${formatDuration(
              sub.durationValue,
              sub.durationUnit
            )} (€${formatPrice(sub.price)})`,
          })),
        ]}
        required={formData.role === "CLIENT"}
      />

      {formData.subscriptionTypeId && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data Inizio"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange("startDate")}
              required
            />
            <Input
              label="Data Fine (Auto-calcolata)"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange("endDate")}
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            💡 La data di fine viene calcolata automaticamente in base al tipo
            di abbonamento selezionato
          </p>
        </>
      )}

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Annulla
        </Button>
        <Button type="submit" className="flex-1">
          Aggiungi Membro
        </Button>
      </ModalFooter>
    </form>
  );
}
