// app/dashboard/gym/page.js
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// ========================================================
// Componente #1: Gestione Tipi di Abbonamento (con Archiviazione)
// ========================================================
function SubscriptionManager({ allSubscriptions, onDataChange }) {
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSub, setCurrentSub] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filtra e ordina gli abbonamenti per la visualizzazione
  const activeSubscriptions = allSubscriptions
    .filter((sub) => sub.isActive)
    .sort((a, b) => a.name.localeCompare(b.name));
  const archivedSubscriptions = allSubscriptions
    .filter((sub) => !sub.isActive)
    .sort((a, b) => a.name.localeCompare(b.name));

  // --- FUNZIONE PER LA CREAZIONE ---
  const handleCreate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/gym/subscription-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          description: createDescription,
        }),
      });
      if (!response.ok) throw new Error(await response.text());

      onDataChange(); // Ricarica i dati nel componente padre
      setCreateName("");
      setCreateDescription("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNZIONI PER LA MODIFICA ---
  const openEditModal = (sub) => {
    setCurrentSub(sub);
    setEditName(sub.name);
    setEditDescription(sub.description || "");
    setError("");
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/gym/subscription-type/${currentSub.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editName,
            description: editDescription,
          }),
        }
      );
      if (!response.ok) throw new Error(await response.text());

      onDataChange();
      setIsEditModalOpen(false);
      setCurrentSub(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNZIONE PER L'ARCHIVIAZIONE ---
  const handleArchive = async (subId) => {
    if (
      !window.confirm(
        "Are you sure you want to archive this subscription? It will no longer be available for new members."
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`/api/gym/subscription-type/${subId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await response.text());
      onDataChange();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // --- FUNZIONE PER LA RIATTIVAZIONE ---
  const handleReactivate = async (subId) => {
    try {
      const response = await fetch(`/api/gym/subscription-type/${subId}`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error(await response.text());
      onDataChange();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-8 mt-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-900">
        Manage Subscription Types
      </h3>
      {/* Form di creazione */}
      <form
        onSubmit={handleCreate}
        className="p-4 mt-4 space-y-4 border rounded-md bg-gray-50"
      >
        <input
          value={createName}
          onChange={(e) => setCreateName(e.target.value)}
          placeholder="New Subscription Name (e.g., Monthly Open)"
          required
          className="w-full px-4 py-2 bg-white border rounded-md"
        />
        <textarea
          value={createDescription}
          onChange={(e) => setCreateDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full px-4 py-2 bg-white border rounded-md"
        ></textarea>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          {isLoading ? "Creating..." : "Create Type"}
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </form>

      {/* Lista degli abbonamenti ATTIVI */}
      <div className="mt-6">
        <h4 className="font-semibold text-gray-800">Active Types:</h4>
        {activeSubscriptions.length === 0 ? (
          <p className="mt-2 text-gray-500">No active subscription types.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {activeSubscriptions.map((sub) => (
              <li
                key={sub.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
              >
                <span className="text-gray-700">{sub.name}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => openEditModal(sub)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleArchive(sub.id)}
                    className="text-sm font-medium text-yellow-600 hover:text-yellow-800"
                  >
                    Archive
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Lista degli abbonamenti ARCHIVIATI */}
      <div className="mt-6 border-t pt-4">
        <h4 className="font-semibold text-gray-800">Archived Types:</h4>
        {archivedSubscriptions.length === 0 ? (
          <p className="mt-2 text-gray-500">No archived subscription types.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {archivedSubscriptions.map((sub) => (
              <li
                key={sub.id}
                className="flex items-center justify-between p-2 rounded-md bg-gray-100 text-gray-500"
              >
                <span>{sub.name}</span>
                <button
                  onClick={() => handleReactivate(sub.id)}
                  className="text-sm font-medium text-green-600 hover:text-green-800"
                >
                  Re-activate
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modale di Modifica */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h3 className="text-lg font-bold">Edit Subscription Type</h3>
            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
              ></textarea>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end pt-4 space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 font-semibold bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md disabled:bg-gray-400"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================================
// Componente #2: Form di Aggiunta Membro
// ========================================================
function AddMemberForm({ activeSubscriptionTypes, onMemberAdded }) {
  const initialFormState = {
    email: "",
    firstName: "",
    lastName: "",
    role: "CLIENT",
    subscriptionTypeId: "",
    startDate: "",
    endDate: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeSubscriptionTypes.length > 0) {
      // Se il subscriptionTypeId corrente non è più valido o non è impostato,
      // imposta il primo della lista attiva come default.
      if (
        !formData.subscriptionTypeId ||
        !activeSubscriptionTypes.find(
          (s) => s.id === formData.subscriptionTypeId
        )
      ) {
        setFormData((prev) => ({
          ...prev,
          subscriptionTypeId: activeSubscriptionTypes[0].id,
        }));
      }
    }
  }, [activeSubscriptionTypes, formData.subscriptionTypeId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/gym/add-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(await response.text());

      setSuccess(
        `Member ${formData.firstName} added! An onboarding email has been sent.`
      );
      setFormData(initialFormState);
      if (onMemberAdded) onMemberAdded(); // Callback per aggiornare altre parti della UI in futuro
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 mt-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-900">Add New Member</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            required
            className="w-full px-4 py-2 bg-gray-100 border rounded-md"
          />
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            required
            className="w-full px-4 py-2 bg-gray-100 border rounded-md"
          />
        </div>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address"
          required
          className="w-full px-4 py-2 bg-gray-100 border rounded-md"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 bg-gray-100 border rounded-md"
            >
              <option value="CLIENT">Client</option>
              <option value="TRAINER">Trainer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subscription Type
            </label>
            <select
              name="subscriptionTypeId"
              value={formData.subscriptionTypeId}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 bg-gray-100 border rounded-md"
              disabled={activeSubscriptionTypes.length === 0}
            >
              {activeSubscriptionTypes.length === 0 ? (
                <option>Please create an active subscription type first</option>
              ) : (
                activeSubscriptionTypes.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 bg-gray-100 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 bg-gray-100 border rounded-md"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {isLoading ? "Adding..." : "Add Member & Send Invite"}
        </button>
        {error && (
          <p className="mt-2 text-sm text-center text-red-600">{error}</p>
        )}
        {success && (
          <p className="mt-2 text-sm text-center text-green-600">{success}</p>
        )}
      </form>
    </div>
  );
}

// ========================================================
// Componente #3: Pagina Principale della Dashboard
// ========================================================
export default function GymDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const response = await fetch("/api/gym/subscription-type");
      if (!response.ok) throw new Error("Failed to fetch subscription types");
      const data = await response.json();
      setAllSubscriptions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || session?.user?.entityType !== "gym") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [session, status, router]);

  if (status === "loading" || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading Dashboard...
      </div>
    );
  }

  if (session && session.user.entityType === "gym") {
    const activeSubscriptions = allSubscriptions.filter((sub) => sub.isActive);

    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="flex items-center justify-between p-4 bg-white shadow-md">
          <h1 className="text-xl font-bold text-indigo-600">MyGym Dashboard</h1>
          <div>
            <span className="mr-4 text-gray-800">
              Welcome, {session.user.name || session.user.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-4 py-2 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600"
            >
              Log Out
            </button>
          </div>
        </nav>

        <main className="p-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AddMemberForm
              activeSubscriptionTypes={activeSubscriptions}
              onMemberAdded={() => {
                /* In futuro, qui potremmo ricaricare la lista dei membri */
              }}
            />
            <SubscriptionManager
              allSubscriptions={allSubscriptions}
              onDataChange={fetchData}
            />
          </div>
        </main>
      </div>
    );
  }

  return null;
}
