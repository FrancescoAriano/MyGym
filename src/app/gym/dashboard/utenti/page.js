"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Toast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { DashboardHeader } from "@/components/dashboard";
import { AddMemberForm } from "@/components/dashboard/AddMemberForm";
import { useMembersData } from "@/hooks/useMembersData";
import { useSubscriptionsData } from "@/hooks/useSubscriptionsData";
import { formatPrice, formatDuration, formatDate } from "@/lib/formatters";
import {
  HiMagnifyingGlass,
  HiUserPlus,
  HiPencil,
  HiTrash,
  HiCheck,
  HiScale,
  HiArrowPath,
} from "react-icons/hi2";

export default function UtentiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    members,
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = useMembersData();
  const { activeSubscriptions, isLoading: subscriptionsLoading } =
    useSubscriptionsData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Conferma modali
  const [confirmAdd, setConfirmAdd] = useState(null);
  const [confirmEdit, setConfirmEdit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

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

  // Calcola automaticamente la data di fine abbonamento - memoized per evitare re-render
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

  // Aggiorna endDate anche in modifica
  useEffect(() => {
    if (
      selectedMember?.subscriptionTypeId &&
      selectedMember?.startDate &&
      isModalOpen
    ) {
      const endDate = calculateEndDate(
        selectedMember.subscriptionTypeId,
        selectedMember.startDate
      );
      setSelectedMember((prev) => ({ ...prev, endDate }));
    }
  }, [
    selectedMember?.subscriptionTypeId,
    selectedMember?.startDate,
    calculateEndDate,
    isModalOpen,
  ]);

  const handleEdit = (member) => {
    const startDate = member.startDate
      ? new Date(member.startDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    setSelectedMember({
      userId: member.user.id,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      email: member.user.email,
      role: member.role,
      subscriptionTypeId: member.subscriptionTypeId || "",
      startDate,
      endDate: member.endDate
        ? new Date(member.endDate).toISOString().split("T")[0]
        : "",
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Mostra modal di conferma
    const member = members.find((m) => m.user.id === selectedMember.userId);
    setConfirmEdit({
      ...selectedMember,
      oldRole: member.role,
      oldSubscription: member.subscriptionType?.name,
      newSubscription: activeSubscriptions.find(
        (s) => s.id === selectedMember.subscriptionTypeId
      )?.name,
    });
  };

  const confirmUpdateMember = async () => {
    try {
      const updateData = {
        userId: confirmEdit.userId,
        userData: {
          firstName: confirmEdit.firstName,
          lastName: confirmEdit.lastName,
        },
        membershipData: {
          role: confirmEdit.role,
          endDate: confirmEdit.endDate,
        },
      };

      // Aggiungi subscriptionTypeId solo se il ruolo è CLIENT o se c'è un abbonamento
      if (confirmEdit.role === "CLIENT" || confirmEdit.subscriptionTypeId) {
        updateData.membershipData.subscriptionTypeId =
          confirmEdit.subscriptionTypeId;
      }

      const response = await fetch("/api/gym/member/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error(await response.text());
      await refetchMembers();
      setIsModalOpen(false);
      setConfirmEdit(null);
      showToast("Membro aggiornato con successo!");
    } catch (error) {
      showToast(error.message, "error");
      setConfirmEdit(null);
    }
  };

  const handleDelete = async (userId) => {
    const member = members.find((m) => m.user.id === userId);
    setConfirmDelete({
      userId,
      name: `${member.user.firstName} ${member.user.lastName}`,
      email: member.user.email,
    });
  };

  const confirmDeleteMember = async () => {
    try {
      const response = await fetch("/api/gym/member/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: confirmDelete.userId }),
      });
      if (!response.ok) throw new Error(await response.text());
      await refetchMembers();
      setConfirmDelete(null);
      showToast("Membro rimosso con successo!");
    } catch (error) {
      showToast(error.message, "error");
      setConfirmDelete(null);
    }
  };

  const handleAddMemberSubmit = async (formData) => {
    // Validazione: cliente deve avere abbonamento
    if (formData.role === "CLIENT" && !formData.subscriptionTypeId) {
      showToast("I clienti devono avere un abbonamento", "error");
      return;
    }

    // Mostra modal di conferma con riepilogo
    const subscription = activeSubscriptions.find(
      (s) => s.id === formData.subscriptionTypeId
    );

    setConfirmAdd({
      ...formData,
      subscriptionName: subscription?.name || "Nessuno",
    });
  };

  const confirmAddMember = async () => {
    try {
      const dataToSend = {
        email: confirmAdd.email,
        firstName: confirmAdd.firstName,
        lastName: confirmAdd.lastName,
        role: confirmAdd.role,
        startDate: confirmAdd.startDate,
        endDate: confirmAdd.endDate,
      };

      // Aggiungi subscriptionTypeId solo se il ruolo è CLIENT o se c'è un abbonamento
      if (confirmAdd.role === "CLIENT" || confirmAdd.subscriptionTypeId) {
        dataToSend.subscriptionTypeId = confirmAdd.subscriptionTypeId;
      }

      const response = await fetch("/api/gym/member/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) throw new Error(await response.text());
      await refetchMembers();
      setIsAddModalOpen(false);
      setConfirmAdd(null);
      showToast("Membro aggiunto! Email di onboarding inviata.");
    } catch (error) {
      showToast(error.message, "error");
      setConfirmAdd(null);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === "loading" || membersLoading || subscriptionsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <div className="h-10 w-64 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 bg-muted animate-pulse rounded" />
          <TableSkeleton rows={8} columns={6} />
        </div>
      </DashboardLayout>
    );
  }

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
          title="Utenti"
          subtitle="Gestisci i membri della tua palestra"
          action={
            <Button onClick={() => setIsAddModalOpen(true)} icon={HiUserPlus}>
              Aggiungi Membro
            </Button>
          }
        />

        {/* Search */}
        <Input
          type="text"
          placeholder="Cerca per nome o email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={HiMagnifyingGlass}
        />

        {/* Members List */}
        <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Ruolo
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Abbonamento
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Scadenza
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Stato
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.map((member) => {
                  const daysLeft = member.endDate
                    ? Math.ceil(
                        (new Date(member.endDate) - new Date()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : null;
                  const isExpiring =
                    daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">
                          {member.user.firstName} {member.user.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {member.user.email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            member.role === "TRAINER" ? "info" : "default"
                          }
                        >
                          {member.role === "TRAINER" ? "Trainer" : "Cliente"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {member.subscriptionType?.name || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {member.endDate ? (
                          <span
                            className={`text-sm ${
                              isExpiring
                                ? "text-destructive font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            {formatDate(member.endDate)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            member.status === "ACTIVE" ? "success" : "default"
                          }
                          icon={member.status === "ACTIVE" ? HiCheck : null}
                        >
                          {member.status === "ACTIVE" ? "Attivo" : "Inattivo"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              router.push(
                                `/gym/dashboard/utenti/${member.user.id}`
                              )
                            }
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Visualizza peso"
                          >
                            <HiScale className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(member)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Modifica"
                          >
                            <HiPencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.user.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Elimina"
                          >
                            <HiTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredMembers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nessun membro trovato
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedMember && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Modifica Membro"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nome"
                type="text"
                value={selectedMember.firstName}
                onChange={(e) =>
                  setSelectedMember({
                    ...selectedMember,
                    firstName: e.target.value,
                  })
                }
                required
              />
              <Input
                label="Cognome"
                type="text"
                value={selectedMember.lastName}
                onChange={(e) =>
                  setSelectedMember({
                    ...selectedMember,
                    lastName: e.target.value,
                  })
                }
                required
              />
            </div>

            <Select
              label="Ruolo"
              value={selectedMember.role}
              onChange={(value) =>
                setSelectedMember({ ...selectedMember, role: value })
              }
              options={[
                { value: "CLIENT", label: "Cliente" },
                { value: "TRAINER", label: "Trainer" },
              ]}
            />

            {/* Abbonamento opzionale per trainer */}
            <Select
              label={`Abbonamento ${
                selectedMember.role === "TRAINER" ? "(Opzionale)" : ""
              }`}
              value={selectedMember.subscriptionTypeId}
              onChange={(value) =>
                setSelectedMember({
                  ...selectedMember,
                  subscriptionTypeId: value,
                })
              }
              options={[
                ...(selectedMember.role === "TRAINER"
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
              required={selectedMember.role === "CLIENT"}
            />

            {selectedMember.subscriptionTypeId && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Data Inizio"
                  type="date"
                  value={selectedMember.startDate}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      startDate: e.target.value,
                    })
                  }
                  required
                />
                <Input
                  label="Data Scadenza"
                  type="date"
                  value={selectedMember.endDate}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      endDate: e.target.value,
                    })
                  }
                  required
                />
              </div>
            )}

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
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

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Aggiungi Nuovo Membro"
        >
          <AddMemberForm
            activeSubscriptions={activeSubscriptions}
            onSubmit={handleAddMemberSubmit}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </Modal>
      )}

      {/* Confirmation Modal - Add */}
      {confirmAdd && (
        <ConfirmationModal
          isOpen={!!confirmAdd}
          onClose={() => setConfirmAdd(null)}
          onConfirm={confirmAddMember}
          title="Conferma Aggiunta Membro"
          message="Stai per aggiungere il seguente membro:"
          confirmText="Aggiungi Membro"
          cancelText="Annulla"
          type="info"
        >
          <div className="mt-4 text-left bg-muted/30 rounded-lg p-4 border border-border space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nome:</span>
              <span className="text-sm font-medium text-foreground">
                {confirmAdd.firstName} {confirmAdd.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="text-sm font-medium text-foreground">
                {confirmAdd.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ruolo:</span>
              <span className="text-sm font-medium text-foreground">
                {confirmAdd.role === "TRAINER" ? "Trainer" : "Cliente"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Abbonamento:
              </span>
              <span className="text-sm font-medium text-foreground">
                {confirmAdd.subscriptionName}
              </span>
            </div>
            {confirmAdd.subscriptionTypeId && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Inizio:</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(confirmAdd.startDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Scadenza:
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(confirmAdd.endDate)}
                  </span>
                </div>
              </>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground text-center">
            Verrà inviata un&apos;email di onboarding all&apos;indirizzo
            specificato.
          </p>
        </ConfirmationModal>
      )}

      {/* Confirmation Modal - Edit */}
      {confirmEdit && (
        <ConfirmationModal
          isOpen={!!confirmEdit}
          onClose={() => setConfirmEdit(null)}
          onConfirm={confirmUpdateMember}
          title="Conferma Modifica Membro"
          message="Stai per modificare i dati di questo membro. Vuoi procedere?"
          confirmText="Sì, Modifica"
          cancelText="Annulla"
          type="warning"
        >
          <div className="mt-4 text-left bg-muted/30 rounded-lg p-4 border border-border space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nome:</span>
              <span className="text-sm font-medium text-foreground">
                {confirmEdit.firstName} {confirmEdit.lastName}
              </span>
            </div>
            {confirmEdit.role !== confirmEdit.oldRole && (
              <div className="flex justify-between items-center bg-warning/10 px-2 py-1 rounded">
                <span className="text-sm text-muted-foreground">Ruolo:</span>
                <span className="text-sm font-medium text-foreground">
                  {confirmEdit.oldRole === "TRAINER" ? "Trainer" : "Cliente"} →{" "}
                  {confirmEdit.role === "TRAINER" ? "Trainer" : "Cliente"}
                </span>
              </div>
            )}
            {confirmEdit.newSubscription !== confirmEdit.oldSubscription && (
              <div className="flex justify-between items-center bg-warning/10 px-2 py-1 rounded">
                <span className="text-sm text-muted-foreground">
                  Abbonamento:
                </span>
                <span className="text-sm font-medium text-foreground">
                  {confirmEdit.oldSubscription || "Nessuno"} →{" "}
                  {confirmEdit.newSubscription || "Nessuno"}
                </span>
              </div>
            )}
          </div>
        </ConfirmationModal>
      )}

      {/* Confirmation Modal - Delete */}
      {confirmDelete && (
        <ConfirmationModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={confirmDeleteMember}
          title="Elimina Membro"
          message={`Sei sicuro di voler rimuovere ${confirmDelete.name} dalla palestra?`}
          confirmText="Sì, Elimina"
          cancelText="Annulla"
          type="danger"
        >
          <div className="mt-4 text-left bg-destructive/10 rounded-lg p-4 border border-destructive/20">
            <p className="text-sm text-foreground">
              <strong className="text-destructive">Attenzione:</strong> Questa
              azione rimuoverà il membro dalla tua palestra. L&apos;utente potrà
              essere ri-aggiunto in futuro.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Email: {confirmDelete.email}
            </p>
          </div>
        </ConfirmationModal>
      )}
    </DashboardLayout>
  );
}
