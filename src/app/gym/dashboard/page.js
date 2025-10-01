// app/dashboard/gym/page.js
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// ========================================================
// Componente #1: Gestione Tipi di Abbonamento
// ========================================================
function SubscriptionManager({ allSubscriptions, onDataChange }) {
  const [baseName, setBaseName] = useState("");
  const [variants, setVariants] = useState([
    { durationValue: "", durationUnit: "MONTH", price: "", description: "" },
  ]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const activeSubscriptions = allSubscriptions.filter((sub) => sub.isActive);
  const archivedSubscriptions = allSubscriptions.filter((sub) => !sub.isActive);

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { durationValue: "", durationUnit: "MONTH", price: "", description: "" },
    ]);
  };
  const handleRemoveVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const handleCreateSubscriptions = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const subscriptionsToCreate = variants.map((variant) => ({
        name: baseName,
        price: parseFloat(variant.price),
        durationValue: parseInt(variant.durationValue),
        durationUnit: variant.durationUnit,
        description: variant.description || null,
      }));
      const payload = { subscriptions: subscriptionsToCreate };

      // **MODIFICA PATH API**
      const response = await fetch("/api/gym/subscription-type/protected", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await response.text());

      onDataChange();
      setBaseName("");
      setVariants([
        {
          durationValue: "",
          durationUnit: "MONTH",
          price: "",
          description: "",
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (sub) => {
    setEditingSub({
      id: sub.id,
      baseName: sub.name,
      description: sub.description || "",
      price: sub.price,
      durationValue: sub.durationValue,
      durationUnit: sub.durationUnit,
    });
    setError("");
    setIsEditModalOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditingSub((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const payload = {
        name: editingSub.baseName,
        description: editingSub.description,
        price: parseFloat(editingSub.price),
        durationValue: parseInt(editingSub.durationValue),
        durationUnit: editingSub.durationUnit,
      };

      // **MODIFICA PATH API**
      const response = await fetch(
        `/api/gym/subscription-type/protected/${editingSub.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error(await response.text());

      onDataChange();
      setIsEditModalOpen(false);
      setEditingSub(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (subId) => {
    if (
      !window.confirm(
        "Are you sure? This will hide the subscription from new members."
      )
    ) {
      return;
    }
    try {
      // **MODIFICA PATH API**
      const response = await fetch(
        `/api/gym/subscription-type/protected/${subId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error(await response.text());
      onDataChange();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleReactivate = async (subId) => {
    try {
      // **MODIFICA PATH API**
      const response = await fetch(
        `/api/gym/subscription-type/protected/${subId}`,
        { method: "PATCH" }
      );
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
      <form
        onSubmit={handleCreateSubscriptions}
        className="p-4 mt-4 space-y-4 border rounded-md bg-gray-50"
      >
        <input
          value={baseName}
          onChange={(e) => setBaseName(e.target.value)}
          placeholder="Base Name (e.g., Bronze, Silver)"
          required
          className="w-full px-4 py-2 bg-white border rounded-md"
        />
        <h4 className="text-sm font-semibold">Variants:</h4>
        {variants.map((variant, index) => (
          <div
            key={index}
            className="flex flex-wrap items-center gap-2 p-2 border rounded-md"
          >
            <input
              type="number"
              placeholder="Duration"
              value={variant.durationValue}
              onChange={(e) =>
                handleVariantChange(index, "durationValue", e.target.value)
              }
              required
              className="flex-grow p-1 border rounded"
              style={{ minWidth: "80px" }}
            />
            <select
              value={variant.durationUnit}
              onChange={(e) =>
                handleVariantChange(index, "durationUnit", e.target.value)
              }
              required
              className="flex-grow p-1 border rounded"
              style={{ minWidth: "100px" }}
            >
              <option value="DAY">Day(s)</option>
              <option value="WEEK">Week(s)</option>
              <option value="MONTH">Month(s)</option>
              <option value="YEAR">Year(s)</option>
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={variant.price}
              onChange={(e) =>
                handleVariantChange(index, "price", e.target.value)
              }
              required
              className="flex-grow p-1 border rounded"
              style={{ minWidth: "80px" }}
            />
            <button
              type="button"
              onClick={() => handleRemoveVariant(index)}
              className="px-2 text-red-500 hover:text-red-700"
              disabled={variants.length <= 1}
            >
              &times;
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddVariant}
          className="text-sm font-medium text-blue-600"
        >
          + Add another variant
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          {isLoading
            ? "Creating..."
            : `Create ${variants.length} Subscription(s)`}
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </form>
      <div className="mt-6">
        <h4 className="font-semibold text-gray-800">Active Types:</h4>
        {activeSubscriptions.length === 0 ? (
          <p className="mt-2 text-gray-500">No active subscription types.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {activeSubscriptions.map((sub) => {
              const displayName = `${sub.name} - ${
                sub.durationValue
              } ${sub.durationUnit.toLowerCase()}(s)`;
              return (
                <li
                  key={sub.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                >
                  <span>
                    {displayName}{" "}
                    <span className="text-sm text-gray-500">
                      ({sub.price}€)
                    </span>
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => openEditModal(sub)}
                      className="text-sm font-medium text-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleArchive(sub.id)}
                      className="text-sm font-medium text-yellow-600"
                    >
                      Archive
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="mt-6 border-t pt-4">
        <h4 className="font-semibold text-gray-800">Archived Types:</h4>
        {archivedSubscriptions.length === 0 ? (
          <p className="mt-2 text-gray-500">No archived subscription types.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {archivedSubscriptions.map((sub) => {
              const displayName = `${sub.name} - ${
                sub.durationValue
              } ${sub.durationUnit.toLowerCase()}(s)`;
              return (
                <li
                  key={sub.id}
                  className="flex items-center justify-between p-2 bg-gray-100 rounded-md text-gray-500"
                >
                  <span>{displayName}</span>
                  <button
                    onClick={() => handleReactivate(sub.id)}
                    className="text-sm font-medium text-green-600"
                  >
                    Re-activate
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {isEditModalOpen && editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
            <h3 className="text-lg font-bold">Edit Subscription Type</h3>
            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Base Name
                </label>
                <input
                  value={editingSub.baseName}
                  onChange={(e) => handleEditChange("baseName", e.target.value)}
                  required
                  className="w-full px-4 py-2 mt-1 border rounded-md"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Duration
                  </label>
                  <input
                    type="number"
                    value={editingSub.durationValue}
                    onChange={(e) =>
                      handleEditChange("durationValue", e.target.value)
                    }
                    required
                    className="w-full px-4 py-2 mt-1 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unit
                  </label>
                  <select
                    value={editingSub.durationUnit}
                    onChange={(e) =>
                      handleEditChange("durationUnit", e.target.value)
                    }
                    required
                    className="w-full px-4 py-2 mt-1 border rounded-md"
                  >
                    <option value="DAY">Day(s)</option>
                    <option value="WEEK">Week(s)</option>
                    <option value="MONTH">Month(s)</option>
                    <option value="YEAR">Year(s)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingSub.price}
                    onChange={(e) => handleEditChange("price", e.target.value)}
                    required
                    className="w-full px-4 py-2 mt-1 border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={editingSub.description}
                  onChange={(e) =>
                    handleEditChange("description", e.target.value)
                  }
                  className="w-full px-4 py-2 mt-1 border rounded-md"
                ></textarea>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end pt-4 space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 font-semibold bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md"
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

  const calculateEndDate = (startDate, durationValue, durationUnit) => {
    if (!startDate || !durationValue || !durationUnit) return "";
    const date = new Date(startDate);
    if (durationUnit === "DAY") date.setDate(date.getDate() + durationValue);
    if (durationUnit === "WEEK")
      date.setDate(date.getDate() + durationValue * 7);
    if (durationUnit === "MONTH")
      date.setMonth(date.getMonth() + durationValue);
    if (durationUnit === "YEAR")
      date.setFullYear(date.getFullYear() + durationValue);
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (activeSubscriptionTypes.length > 0) {
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

  useEffect(() => {
    if (formData.startDate && formData.subscriptionTypeId) {
      const selectedSubType = activeSubscriptionTypes.find(
        (sub) => sub.id === formData.subscriptionTypeId
      );
      if (selectedSubType) {
        const newEndDate = calculateEndDate(
          formData.startDate,
          selectedSubType.durationValue,
          selectedSubType.durationUnit
        );
        setFormData((prev) => ({ ...prev, endDate: newEndDate }));
      }
    }
  }, [
    formData.startDate,
    formData.subscriptionTypeId,
    activeSubscriptionTypes,
  ]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      // **MODIFICA PATH API**
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
      if (onMemberAdded) onMemberAdded();
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
                activeSubscriptionTypes.map((sub) => {
                  const displayName = `${sub.name} - ${
                    sub.durationValue
                  } ${sub.durationUnit.toLowerCase()}(s)`;
                  return (
                    <option key={sub.id} value={sub.id}>
                      {displayName}
                    </option>
                  );
                })
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
      // **MODIFICA PATH API**
      const response = await fetch("/api/gym/subscription-type/protected");
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
                /* Ricarica lista membri */
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
