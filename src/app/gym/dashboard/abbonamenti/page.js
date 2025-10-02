"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { HiPlus, HiPencil, HiArchiveBox, HiTrash, HiArrowPath, HiXMark, HiChartBar } from "react-icons/hi2"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export default function AbbonamentiPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState([])
  const [members, setMembers] = useState([])
  const [activeTab, setActiveTab] = useState("active")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedSub, setSelectedSub] = useState(null)
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
      const [subsRes, membersRes] = await Promise.all([
        fetch("/api/gym/subscription-type/protected/get"),
        fetch("/api/gym/member/get"),
      ])
      if (subsRes.ok) setSubscriptions(await subsRes.json())
      if (membersRes.ok) setMembers(await membersRes.json())
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

  const handleCreate = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    try {
      const response = await fetch("/api/gym/subscription-type/protected/create", {
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
      })
      if (!response.ok) throw new Error(await response.text())
      await fetchData()
      setIsAddModalOpen(false)
      showToast("Abbonamento creato con successo!")
      e.target.reset()
    } catch (error) {
      showToast(error.message, "error")
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/gym/subscription-type/protected/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedSub),
      })
      if (!response.ok) throw new Error(await response.text())
      await fetchData()
      setIsEditModalOpen(false)
      showToast("Abbonamento aggiornato!")
    } catch (error) {
      showToast(error.message, "error")
    }
  }

  const handleArchive = async (id) => {
    try {
      const response = await fetch("/api/gym/subscription-type/protected/archive", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) throw new Error(await response.text())
      await fetchData()
      showToast("Abbonamento archiviato!")
    } catch (error) {
      showToast(error.message, "error")
    }
  }

  const handleRestore = async (id) => {
    try {
      const response = await fetch("/api/gym/subscription-type/protected/restore", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) throw new Error(await response.text())
      await fetchData()
      showToast("Abbonamento ripristinato!")
    } catch (error) {
      showToast(error.message, "error")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Eliminare permanentemente questo abbonamento?")) return
    try {
      const response = await fetch("/api/gym/subscription-type/protected/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) throw new Error(await response.text())
      await fetchData()
      showToast("Abbonamento eliminato!")
    } catch (error) {
      showToast(error.message, "error")
    }
  }

  const activeSubscriptions = subscriptions.filter((s) => s.isActive)
  const archivedSubscriptions = subscriptions.filter((s) => !s.isActive)

  // Chart data
  const pieData = activeSubscriptions.map((sub) => ({
    name: sub.name,
    value: members.filter((m) => m.subscriptionTypeId === sub.id).length,
  }))

  const revenueData = activeSubscriptions.map((sub) => ({
    name: sub.name,
    revenue: members.filter((m) => m.subscriptionTypeId === sub.id).length * Number.parseFloat(sub.price),
  }))

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
            <h1 className="text-3xl font-bold text-foreground">Abbonamenti</h1>
            <p className="text-muted-foreground mt-1">Gestisci i tipi di abbonamento</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
          >
            <HiPlus className="h-5 w-5" />
            Nuovo Abbonamento
          </button>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <HiChartBar className="h-5 w-5 text-primary" />
              Distribuzione Membri
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <HiChartBar className="h-5 w-5 text-primary" />
              Entrate Potenziali
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
          {(activeTab === "active" ? activeSubscriptions : archivedSubscriptions).map((sub) => {
            const memberCount = members.filter((m) => m.subscriptionTypeId === sub.id).length
            return (
              <div
                key={sub.id}
                className="bg-card rounded-xl border border-border p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{sub.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {sub.durationValue} {sub.durationUnit.toLowerCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">€{Number.parseFloat(sub.price).toFixed(2)}</p>
                  </div>
                </div>
                {sub.description && <p className="text-sm text-muted-foreground mb-4">{sub.description}</p>}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    {memberCount} {memberCount === 1 ? "membro" : "membri"}
                  </span>
                  <div className="flex items-center gap-2">
                    {activeTab === "active" ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedSub(sub)
                            setIsEditModalOpen(true)
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
            )
          })}
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Nuovo Abbonamento</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <HiXMark className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Durata</label>
                  <input
                    type="number"
                    name="durationValue"
                    required
                    min="1"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Unità</label>
                  <select
                    name="durationUnit"
                    defaultValue="MONTH"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="DAY">Giorni</option>
                    <option value="WEEK">Settimane</option>
                    <option value="MONTH">Mesi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Prezzo (€)</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Descrizione (opzionale)</label>
                <textarea
                  name="description"
                  rows="3"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
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
                  Crea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Modifica Abbonamento</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <HiXMark className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                <input
                  type="text"
                  value={selectedSub.name}
                  onChange={(e) => setSelectedSub({ ...selectedSub, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Durata</label>
                  <input
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
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Unità</label>
                  <select
                    value={selectedSub.durationUnit}
                    onChange={(e) =>
                      setSelectedSub({
                        ...selectedSub,
                        durationUnit: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="DAY">Giorni</option>
                    <option value="WEEK">Settimane</option>
                    <option value="MONTH">Mesi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Prezzo (€)</label>
                  <input
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
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Descrizione</label>
                <textarea
                  value={selectedSub.description || ""}
                  onChange={(e) =>
                    setSelectedSub({
                      ...selectedSub,
                      description: e.target.value,
                    })
                  }
                  rows="3"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
    </DashboardLayout>
  )
}
