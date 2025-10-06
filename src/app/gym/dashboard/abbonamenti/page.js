"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Toast } from "@/components/ui/Toast";
import { CardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { DashboardHeader } from "@/components/dashboard";
import { PieChart, BarChart } from "@/components/charts";
import { useMembersData } from "@/hooks/useMembersData";
import { useSubscriptionsData } from "@/hooks/useSubscriptionsData";
import { ChartFactory } from "@/lib/ChartFactory";
import { formatPrice, formatDuration } from "@/lib/formatters";
import {
  HiPlus,
  HiPencil,
  HiArchiveBox,
  HiTrash,
  HiArrowPath,
  HiXMark,
} from "react-icons/hi2";

export default function AbbonamentiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { members, isLoading: membersLoading } = useMembersData();
  const {
    subscriptions,
    activeSubscriptions,
    archivedSubscriptions,
    isLoading: subscriptionsLoading,
    refetch: refetchSubscriptions,
  } = useSubscriptionsData();

  const [activeTab, setActiveTab] = useState("active");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [toast, setToast] = useState(null);

  // Conferma modali
  const [confirmCreate, setConfirmCreate] = useState(null);
  const [confirmEdit, setConfirmEdit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Varianti dello stesso abbonamento
  const [subscriptionVariants, setSubscriptionVariants] = useState([
    { durationValue: 1, durationUnit: "MONTH", price: 0 },
  ]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || session?.user?.entityType !== "gym") {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addVariant = () => {
    setSubscriptionVariants([
      ...subscriptionVariants,
      { durationValue: 1, durationUnit: "MONTH", price: 0 },
    ]);
  };

  const removeVariant = (index) => {
    if (subscriptionVariants.length > 1) {
      setSubscriptionVariants(
        subscriptionVariants.filter((_, i) => i !== index)
      );
    }
  };

  const updateVariant = (index, field, value) => {
    const updated = [...subscriptionVariants];
    updated[index][field] = value;
    setSubscriptionVariants(updated);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const description = formData.get("description") || null;

    // Crea array di abbonamenti con le varianti
    const subscriptionsToCreate = subscriptionVariants.map((variant) => ({
      name,
      description,
      price: Number.parseFloat(variant.price),
      durationValue: Number.parseInt(variant.durationValue),
      durationUnit: variant.durationUnit,
    }));

    // Mostra modal di conferma con riepilogo
    setConfirmCreate({
      name,
      description,
      variants: subscriptionsToCreate,
    });
  };

  const confirmCreateSubscription = async () => {
    try {
      const response = await fetch(
        "/api/gym/subscription-type/protected/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscriptions: confirmCreate.variants,
          }),
        }
      );
      if (!response.ok) throw new Error(await response.text());
      await refetchSubscriptions();
      setIsAddModalOpen(false);
      setConfirmCreate(null);
      setSubscriptionVariants([
        { durationValue: 1, durationUnit: "MONTH", price: 0 },
      ]);
      showToast(`Abbonamento "${confirmCreate.name}" creato con successo!`);
    } catch (error) {
      showToast(error.message, "error");
      setConfirmCreate(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Conta quanti membri hanno questo abbonamento
    const memberCount = members.filter(
      (m) => m.subscriptionTypeId === selectedSub.id
    ).length;

    setConfirmEdit({ ...selectedSub, memberCount });
  };

  const confirmUpdateSubscription = async () => {
    try {
      const response = await fetch(
        "/api/gym/subscription-type/protected/update",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(confirmEdit),
        }
      );
      if (!response.ok) throw new Error(await response.text());
      await refetchSubscriptions();
      setIsEditModalOpen(false);
      setConfirmEdit(null);
      showToast("Abbonamento aggiornato con successo!");
    } catch (error) {
      showToast(error.message, "error");
      setConfirmEdit(null);
    }
  };

  const handleArchive = async (id) => {
    try {
      const response = await fetch(
        "/api/gym/subscription-type/protected/archive",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );
      if (!response.ok) throw new Error(await response.text());
      await refetchSubscriptions();
      showToast("Abbonamento archiviato!");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleRestore = async (id) => {
    try {
      const response = await fetch(
        "/api/gym/subscription-type/protected/restore",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );
      if (!response.ok) throw new Error(await response.text());
      await refetchSubscriptions();
      showToast("Abbonamento ripristinato!");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleDelete = async (id) => {
    // Conta membri con questo abbonamento
    const memberCount = members.filter(
      (m) => m.subscriptionTypeId === id
    ).length;
    const sub = [...activeSubscriptions, ...archivedSubscriptions].find(
      (s) => s.id === id
    );

    setConfirmDelete({ id, name: sub?.name, memberCount });
  };

  const confirmDeleteSubscription = async () => {
    try {
      const response = await fetch(
        "/api/gym/subscription-type/protected/delete",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: confirmDelete.id }),
        }
      );
      if (!response.ok) throw new Error(await response.text());
      await refetchSubscriptions();
      setConfirmDelete(null);
      showToast("Abbonamento eliminato permanentemente!");
    } catch (error) {
      showToast(error.message, "error");
      setConfirmDelete(null);
    }
  };

  if (status === "loading" || membersLoading || subscriptionsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <CardSkeleton lines={2} />
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <CardSkeleton lines={5} />
        </div>
      </DashboardLayout>
    );
  }

  // Use ChartFactory to create chart data
  const pieChartConfig = ChartFactory.createMemberDistributionChart(
    members,
    subscriptions
  );
  const barChartConfig = ChartFactory.createRevenueChart(
    members,
    subscriptions
  );

  return (
    <DashboardLayout gymName={session?.user?.name || "MyGym"}>
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <DashboardHeader
          title="Abbonamenti"
          subtitle="Gestisci i tipi di abbonamento"
          action={
            <Button onClick={() => setIsAddModalOpen(true)} icon={HiPlus}>
              Nuovo Abbonamento
            </Button>
          }
        />

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card hover>{ChartFactory.render(pieChartConfig)}</Card>
          <Card hover>{ChartFactory.render(barChartConfig)}</Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab("active")}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "active"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Attivi ({activeSubscriptions.length})
            </button>
            <button
              onClick={() => setActiveTab("archived")}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "archived"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Archiviati ({archivedSubscriptions.length})
            </button>
          </nav>
        </div>

        {/* Subscriptions List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(activeTab === "active"
            ? activeSubscriptions
            : archivedSubscriptions
          ).map((sub) => {
            const memberCount = members.filter(
              (m) => m.subscriptionTypeId === sub.id
            ).length;
            return (
              <div
                key={sub.id}
                className="bg-card rounded-xl border border-border p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {sub.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDuration(sub.durationValue, sub.durationUnit)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      €{formatPrice(sub.price)}
                    </p>
                  </div>
                </div>
                {sub.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {sub.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    {memberCount} {memberCount === 1 ? "membro" : "membri"}
                  </span>
                  <div className="flex items-center gap-2">
                    {activeTab === "active" ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedSub(sub);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <HiPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleArchive(sub.id)}
                          className="p-2 text-muted-foreground hover:text-chart-4 hover:bg-chart-4/10 rounded-lg transition-colors"
                        >
                          <HiArchiveBox className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleRestore(sub.id)}
                          className="p-2 text-muted-foreground hover:text-chart-3 hover:bg-chart-3/10 rounded-lg transition-colors"
                        >
                          <HiArrowPath className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSubscriptionVariants([
              { durationValue: 1, durationUnit: "MONTH", price: 0 },
            ]);
          }}
          title="Nuovo Abbonamento"
          size="lg"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Nome"
              type="text"
              name="name"
              required
              placeholder="es. Bronzo"
            />
            <Textarea
              label="Descrizione (opzionale)"
              name="description"
              rows="3"
              placeholder="Descrizione dell'abbonamento..."
            />

            <div className="border-t border-border pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Varianti di Prezzo e Durata
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                  icon={HiPlus}
                >
                  Aggiungi Variante
                </Button>
              </div>

              <div className="space-y-3">
                {subscriptionVariants.map((variant, index) => (
                  <div
                    key={index}
                    className="flex items-end gap-3 p-3 bg-muted/30 rounded-lg border border-border"
                  >
                    <Input
                      label="Durata"
                      type="number"
                      value={variant.durationValue}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          "durationValue",
                          Number.parseInt(e.target.value)
                        )
                      }
                      required
                      min="1"
                      className="flex-1"
                    />
                    <Select
                      label="Unità"
                      value={variant.durationUnit}
                      onChange={(value) =>
                        updateVariant(index, "durationUnit", value)
                      }
                      options={[
                        { value: "DAY", label: "Giorni" },
                        { value: "WEEK", label: "Settimane" },
                        { value: "MONTH", label: "Mesi" },
                      ]}
                      className="flex-1"
                    />
                    <Input
                      label="Prezzo (€)"
                      type="number"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          "price",
                          Number.parseFloat(e.target.value)
                        )
                      }
                      required
                      min="0"
                      step="0.01"
                      className="flex-1"
                    />
                    {subscriptionVariants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors mb-2"
                        title="Rimuovi variante"
                      >
                        <HiXMark className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSubscriptionVariants([
                    { durationValue: 1, durationUnit: "MONTH", price: 0 },
                  ]);
                }}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button type="submit" className="flex-1">
                Crea Abbonamento
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedSub && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Modifica Abbonamento"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Nome"
              type="text"
              value={selectedSub.name}
              onChange={(e) =>
                setSelectedSub({ ...selectedSub, name: e.target.value })
              }
              required
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Durata"
                type="number"
                value={selectedSub.durationValue}
                onChange={(e) =>
                  setSelectedSub({
                    ...selectedSub,
                    durationValue: Number.parseInt(e.target.value),
                  })
                }
                required
                min="1"
              />
              <Select
                label="Unità"
                value={selectedSub.durationUnit}
                onChange={(value) =>
                  setSelectedSub({
                    ...selectedSub,
                    durationUnit: value,
                  })
                }
                options={[
                  { value: "DAY", label: "Giorni" },
                  { value: "WEEK", label: "Settimane" },
                  { value: "MONTH", label: "Mesi" },
                ]}
              />
              <Input
                label="Prezzo (€)"
                type="number"
                value={selectedSub.price}
                onChange={(e) =>
                  setSelectedSub({
                    ...selectedSub,
                    price: Number.parseFloat(e.target.value),
                  })
                }
                required
                min="0"
                step="0.01"
              />
            </div>
            <Textarea
              label="Descrizione"
              value={selectedSub.description || ""}
              onChange={(e) =>
                setSelectedSub({
                  ...selectedSub,
                  description: e.target.value,
                })
              }
              rows="3"
            />
            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button type="submit" className="flex-1">
                Salva Modifiche
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Confirmation Modal - Create */}
      {confirmCreate && (
        <ConfirmationModal
          isOpen={!!confirmCreate}
          onClose={() => setConfirmCreate(null)}
          onConfirm={confirmCreateSubscription}
          title="Conferma Creazione Abbonamento"
          message="Stai per creare il seguente abbonamento con le sue varianti:"
          confirmText="Crea Abbonamento"
          cancelText="Annulla"
          type="info"
        >
          <div className="mt-4 text-left bg-muted/30 rounded-lg p-4 border border-border">
            <h4 className="font-semibold text-foreground mb-2">
              {confirmCreate.name}
            </h4>
            {confirmCreate.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {confirmCreate.description}
              </p>
            )}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Varianti:</p>
              {confirmCreate.variants.map((v, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-sm bg-background px-3 py-2 rounded"
                >
                  <span className="text-muted-foreground">
                    {formatDuration(v.durationValue, v.durationUnit)}
                  </span>
                  <span className="font-semibold text-primary">
                    €{formatPrice(v.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ConfirmationModal>
      )}

      {/* Confirmation Modal - Edit */}
      {confirmEdit && (
        <ConfirmationModal
          isOpen={!!confirmEdit}
          onClose={() => setConfirmEdit(null)}
          onConfirm={confirmUpdateSubscription}
          title="Attenzione: Modifica Abbonamento"
          message={`Se modifichi questo abbonamento, tutti i ${
            confirmEdit.memberCount
          } ${
            confirmEdit.memberCount === 1
              ? "utente che lo ha"
              : "utenti che lo hanno"
          } subiranno le modifiche. Vuoi procedere?`}
          confirmText="Sì, Modifica"
          cancelText="No, Annulla"
          type="warning"
        >
          <div className="mt-4 text-left bg-muted/30 rounded-lg p-4 border border-border">
            <p className="text-sm text-foreground">
              <strong>Suggerimento:</strong> Se non vuoi modificare
              l'abbonamento esistente, crea un nuovo abbonamento invece.
            </p>
          </div>
        </ConfirmationModal>
      )}

      {/* Confirmation Modal - Delete */}
      {confirmDelete && (
        <ConfirmationModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={confirmDeleteSubscription}
          title="Elimina Abbonamento"
          message={`Sei sicuro di voler eliminare permanentemente l'abbonamento "${confirmDelete.name}"?`}
          confirmText="Sì, Elimina"
          cancelText="Annulla"
          type="danger"
        >
          {confirmDelete.memberCount > 0 && (
            <div className="mt-4 text-left bg-destructive/10 rounded-lg p-4 border border-destructive/20">
              <p className="text-sm text-foreground">
                <strong className="text-destructive">Attenzione:</strong> Ci
                sono {confirmDelete.memberCount}{" "}
                {confirmDelete.memberCount === 1 ? "utente" : "utenti"} con
                questo abbonamento. L'eliminazione non sarà possibile fino a
                quando ci sono utenti associati.
              </p>
            </div>
          )}
        </ConfirmationModal>
      )}
    </DashboardLayout>
  );
}
