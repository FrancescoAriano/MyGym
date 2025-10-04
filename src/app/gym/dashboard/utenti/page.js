"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { DashboardHeader } from "@/components/dashboard";
import { useMembersData } from "@/hooks/useMembersData";
import { useSubscriptionsData } from "@/hooks/useSubscriptionsData";
import {
  HiMagnifyingGlass,
  HiUserPlus,
  HiPencil,
  HiTrash,
  HiCheck,
  HiScale,
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

  const handleEdit = (member) => {
    setSelectedMember({
      userId: member.user.id,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      email: member.user.email,
      role: member.role,
      subscriptionTypeId: member.subscriptionTypeId,
      endDate: new Date(member.endDate).toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/gym/member/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedMember.userId,
          userData: {
            firstName: selectedMember.firstName,
            lastName: selectedMember.lastName,
          },
          membershipData: {
            role: selectedMember.role,
            subscriptionTypeId: selectedMember.subscriptionTypeId,
            endDate: selectedMember.endDate,
          },
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      await refetchMembers();
      setIsModalOpen(false);
      showToast("Membro aggiornato con successo!");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Sei sicuro di voler rimuovere questo membro?")) return;
    try {
      const response = await fetch("/api/gym/member/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error(await response.text());
      await refetchMembers();
      showToast("Membro rimosso con successo!");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const response = await fetch("/api/gym/member/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          role: formData.get("role"),
          subscriptionTypeId: formData.get("subscriptionTypeId"),
          startDate: formData.get("startDate"),
          endDate: formData.get("endDate"),
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      await refetchMembers();
      setIsAddModalOpen(false);
      showToast("Membro aggiunto! Email di onboarding inviata.");
      e.target.reset();
    } catch (error) {
      showToast(error.message, "error");
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
                  const daysLeft = Math.ceil(
                    (new Date(member.endDate) - new Date()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const isExpiring = daysLeft <= 7 && daysLeft >= 0;
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
                      <td className="px-6 py-4 text-foreground">
                        {member.subscriptionType.name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm ${
                            isExpiring
                              ? "text-destructive font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {new Date(member.endDate).toLocaleDateString("it-IT")}
                        </span>
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
              />
            </div>
            <Select
              label="Abbonamento"
              value={selectedMember.subscriptionTypeId}
              onChange={(e) =>
                setSelectedMember({
                  ...selectedMember,
                  subscriptionTypeId: e.target.value,
                })
              }
            >
              {activeSubscriptions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} - {sub.durationValue}{" "}
                  {sub.durationUnit.toLowerCase()}
                </option>
              ))}
            </Select>
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
            />
            <ModalFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
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

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Aggiungi Nuovo Membro"
        >
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nome" type="text" name="firstName" required />
              <Input label="Cognome" type="text" name="lastName" required />
            </div>
            <Input label="Email" type="email" name="email" required />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Ruolo" name="role" defaultValue="CLIENT">
                <option value="CLIENT">Cliente</option>
                <option value="TRAINER">Trainer</option>
              </Select>
              <Select label="Abbonamento" name="subscriptionTypeId" required>
                {activeSubscriptions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Data Inizio"
                type="date"
                name="startDate"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
              />
              <Input label="Data Fine" type="date" name="endDate" required />
            </div>
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
                Aggiungi
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
