"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { CardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { DashboardHeader } from "@/components/dashboard";
import { PieChart, BarChart } from "@/components/charts";
import { useMembersData } from "@/hooks/useMembersData";
import { useSubscriptionsData } from "@/hooks/useSubscriptionsData";
import { ChartFactory } from "@/lib/ChartFactory";
import {
  HiPlus,
  HiPencil,
  HiArchiveBox,
  HiTrash,
  HiArrowPath,
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

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const response = await fetch(
        "/api/gym/subscription-type/protected/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscriptions: [
              {
                name: formData.get("name"),
                price: Number.parseFloat(formData.get("price")),
                durationValue: Number.parseInt(formData.get("durationValue")),
                durationUnit: formData.get("durationUnit"),
                description: formData.get("description") || null,
              },
            ],
          }),
        }
      );
      if (!response.ok) throw new Error(await response.text());
      await refetchSubscriptions();
      setIsAddModalOpen(false);
      showToast("Abbonamento creato con successo!");
      e.target.reset();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "/api/gym/subscription-type/protected/update",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedSub),
        }
      );
      if (!response.ok) throw new Error(await response.text());
      await refetchSubscriptions();
      setIsEditModalOpen(false);
      showToast("Abbonamento aggiornato!");
    } catch (error) {
      showToast(error.message, "error");
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
    if (!confirm("Eliminare permanentemente questo abbonamento?")) return;
    try {
      const response = await fetch(
        "/api/gym/subscription-type/protected/delete",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );
      if (!response.ok) throw new Error(await response.text());
      await refetchSubscriptions();
      showToast("Abbonamento eliminato!");
    } catch (error) {
      showToast(error.message, "error");
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
                      {sub.durationValue} {sub.durationUnit.toLowerCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      €{Number.parseFloat(sub.price).toFixed(2)}
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
          onClose={() => setIsAddModalOpen(false)}
          title="Nuovo Abbonamento"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Nome" type="text" name="name" required />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Durata"
                type="number"
                name="durationValue"
                required
                min="1"
              />
              <Select label="Unità" name="durationUnit" defaultValue="MONTH">
                <option value="DAY">Giorni</option>
                <option value="WEEK">Settimane</option>
                <option value="MONTH">Mesi</option>
              </Select>
              <Input
                label="Prezzo (€)"
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
              />
            </div>
            <Textarea
              label="Descrizione (opzionale)"
              name="description"
              rows="3"
            />
            <ModalFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button type="submit" className="flex-1">
                Crea
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
                onChange={(e) =>
                  setSelectedSub({
                    ...selectedSub,
                    durationUnit: e.target.value,
                  })
                }
              >
                <option value="DAY">Giorni</option>
                <option value="WEEK">Settimane</option>
                <option value="MONTH">Mesi</option>
              </Select>
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
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button type="submit" className="flex-1">
                Salva
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
