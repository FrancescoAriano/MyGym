"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { HiMagnifyingGlass, HiUserPlus, HiPencil, HiTrash, HiXMark, HiCheck } from "react-icons/hi2"

export default function UtentiPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [members, setMembers] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated" || session?.user?.entityType !== "gym") {
      router.push("/login")
      return
    }
    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [membersRes, subsRes] = await Promise.all([
        fetch("/api/gym/member/get"),
        fetch("/api/gym/subscription-type/protected/get"),
      ])
      if (membersRes.ok) setMembers(await membersRes.json())
      if (subsRes.ok) setSubscriptions(await subsRes.json())
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleEdit = (member) => {
    setSelectedMember({
      userId: member.user.id,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      email: member.user.email,
      role: member.role,
      subscriptionTypeId: member.subscriptionTypeId,
      endDate: new Date(member.endDate).toISOString().split("T")[0],
    })
    setIsModalOpen(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
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
      })
      if (!response.ok) throw new Error(await response.text())
      await fetchData()
      setIsModalOpen(false)
      showToast("Membro aggiornato con successo!")
    } catch (error) {
      showToast(error.message, "error")
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm("Sei sicuro di voler rimuovere questo membro?")) return
    try {
      const response = await fetch("/api/gym/member/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (!response.ok) throw new Error(await response.text())
      await fetchData()
      showToast("Membro rimosso con successo!")
    } catch (error) {
      showToast(error.message, "error")
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
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
      })
      if (!response.ok) throw new Error(await response.text())
      await fetchData()
      setIsAddModalOpen(false)
      showToast("Membro aggiunto! Email di onboarding inviata.")
      e.target.reset()
    } catch (error) {
      showToast(error.message, "error")
    }
  }

  const filteredMembers = members.filter(
    (m) =>
      m.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (status === "loading" || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Caricamento...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout gymName={session?.user?.name || "MyGym"}>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            toast.type === "success" ? "bg-chart-3 text-white" : "bg-destructive text-destructive-foreground"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Utenti</h1>
            <p className="text-muted-foreground mt-1">Gestisci i membri della tua palestra</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
          >
            <HiUserPlus className="h-5 w-5" />
            Aggiungi Membro
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cerca per nome o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Members List */}
        <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Abbonamento</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Scadenza</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Stato</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.map((member) => {
                  const daysLeft = Math.ceil((new Date(member.endDate) - new Date()) / (1000 * 60 * 60 * 24))
                  const isExpiring = daysLeft <= 7 && daysLeft >= 0
                  return (
                    <tr key={member.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">
                          {member.user.firstName} {member.user.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{member.user.email}</td>
                      <td className="px-6 py-4 text-foreground">{member.subscriptionType.name}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm ${isExpiring ? "text-destructive font-medium" : "text-muted-foreground"}`}
                        >
                          {new Date(member.endDate).toLocaleDateString("it-IT")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            member.status === "ACTIVE" ? "bg-chart-3/20 text-chart-3" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {member.status === "ACTIVE" && <HiCheck className="h-3 w-3" />}
                          {member.status === "ACTIVE" ? "Attivo" : "Inattivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(member)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <HiPencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.user.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <HiTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredMembers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Nessun membro trovato</div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Modifica Membro</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <HiXMark className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                  <input
                    type="text"
                    value={selectedMember.firstName}
                    onChange={(e) =>
                      setSelectedMember({
                        ...selectedMember,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cognome</label>
                  <input
                    type="text"
                    value={selectedMember.lastName}
                    onChange={(e) =>
                      setSelectedMember({
                        ...selectedMember,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Abbonamento</label>
                <select
                  value={selectedMember.subscriptionTypeId}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      subscriptionTypeId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {subscriptions
                    .filter((s) => s.isActive)
                    .map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} - {sub.durationValue} {sub.durationUnit.toLowerCase()}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Data Scadenza</label>
                <input
                  type="date"
                  value={selectedMember.endDate}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      endDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Salva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Aggiungi Nuovo Membro</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <HiXMark className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cognome</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Ruolo</label>
                  <select
                    name="role"
                    defaultValue="CLIENT"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="CLIENT">Cliente</option>
                    <option value="TRAINER">Trainer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Abbonamento</label>
                  <select
                    name="subscriptionTypeId"
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {subscriptions
                      .filter((s) => s.isActive)
                      .map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Data Inizio</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Data Fine</label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Aggiungi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
