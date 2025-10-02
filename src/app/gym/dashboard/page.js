// app/dashboard/gym/page.js
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  HiPlusCircle,
  HiPencil,
  HiArchiveBox,
  HiTrash,
  HiArrowPath,
  HiExclamationTriangle,
  HiUserGroup,
} from "react-icons/hi2";

// ========================================================
// Componente #0A: Notifiche Toast
// ========================================================
function Toast({ message, type, onClear }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClear();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClear]);

  const baseStyle =
    "fixed top-5 right-5 z-50 p-4 rounded-md shadow-lg text-white text-sm";
  const typeStyle = type === "success" ? "bg-green-500" : "bg-red-500";

  return <div className={`${baseStyle} ${typeStyle}`}>{message}</div>;
}

// ========================================================
// Componente #0B: Modale di Conferma
// ========================================================
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = "Confirm",
  confirmColor = "bg-indigo-600",
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-start">
          <div
            className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
              confirmColor === "bg-red-600" ? "bg-red-100" : "bg-indigo-100"
            } sm:mx-0`}
          >
            <HiExclamationTriangle
              className={`h-6 w-6 ${
                confirmColor === "bg-red-600"
                  ? "text-red-600"
                  : "text-indigo-600"
              }`}
              aria-hidden="true"
            />
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-lg font-semibold leading-6 text-gray-900">
              {title}
            </h3>
            <div className="mt-2 text-sm text-gray-500">{children}</div>
          </div>
        </div>
        <div className="flex justify-end pt-6 space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold bg-white text-gray-900 rounded-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-md shadow-sm ${confirmColor} hover:opacity-90`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================================
// Componente #1: Gestione Tipi di Abbonamento
// ========================================================
function SubscriptionManager({ allSubscriptions, onDataChange, showFeedback }) {
  const [baseName, setBaseName] = useState("");
  const [variants, setVariants] = useState([
    { durationValue: "", durationUnit: "MONTH", price: "", description: "" },
  ]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [confirmation, setConfirmation] = useState({ isOpen: false });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [error, setError] = useState("");

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
    setVariants(variants.filter((_, i) => i !== index));
  };

  const showConfirmation = (config) =>
    setConfirmation({ isOpen: true, ...config });
  const closeConfirmation = () => setConfirmation({ isOpen: false });

  const handleCreateSubscriptions = (e) => {
    e.preventDefault();
    const subscriptionsToCreate = variants.map(
      (v) =>
        `${baseName} - ${
          v.durationValue
        } ${v.durationUnit.toLowerCase()}(s) - ${v.price}€`
    );
    showConfirmation({
      title: "Confirm Creation",
      children: (
        <div>
          <p>You are about to create:</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            {subscriptionsToCreate.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      ),
      onConfirm: async () => {
        closeConfirmation();
        setIsLoading(true);
        try {
          const payload = {
            subscriptions: variants.map((v) => ({
              name: baseName,
              price: parseFloat(v.price),
              durationValue: parseInt(v.durationValue),
              durationUnit: v.durationUnit,
              description: v.description || null,
            })),
          };
          const response = await fetch(
            "/api/gym/subscription-type/protected/create",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );
          if (!response.ok) throw new Error(await response.text());
          onDataChange();
          setBaseName("");
          setVariants([
            { durationValue: "", durationUnit: "MONTH", price: "" },
          ]);
          showFeedback("Subscriptions created successfully!", "success");
        } catch (err) {
          showFeedback(err.message, "error");
        } finally {
          setIsLoading(false);
        }
      },
      confirmText: "Create",
    });
  };

  const openEditModal = (sub) => {
    setEditingSub({ id: sub.id, name: sub.name, ...sub });
    setError("");
    setIsEditModalOpen(true);
  };
  const handleEditChange = (field, value) => {
    setEditingSub((prev) => ({ ...prev, [field]: value }));
  };
  const handleUpdate = (e) => {
    e.preventDefault();
    setError("");
    showConfirmation({
      title: "Confirm Update",
      children: (
        <p>
          This will update the subscription for{" "}
          <strong>all existing members</strong> who have it. This is a
          significant change. If you only want to offer a new price, consider
          archiving this one and creating a new subscription.
        </p>
      ),
      onConfirm: async () => {
        closeConfirmation();
        setIsLoading(true);
        try {
          const payload = {
            id: editingSub.id,
            name: editingSub.name,
            description: editingSub.description,
            price: parseFloat(editingSub.price),
            durationValue: parseInt(editingSub.durationValue),
            durationUnit: editingSub.durationUnit,
          };
          const response = await fetch(
            "/api/gym/subscription-type/protected/update",
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );
          if (!response.ok) {
            const errorText = await response.text();
            setError(errorText);
            throw new Error(errorText);
          }
          onDataChange();
          setIsEditModalOpen(false);
          setEditingSub(null);
          showFeedback("Subscription updated!", "success");
        } catch (err) {
          setError(err.message);
          showFeedback(err.message, "error");
        } finally {
          setIsLoading(false);
        }
      },
      confirmText: "Update Anyway",
    });
  };

  const handleArchive = async (subId) => {
    try {
      const response = await fetch(
        "/api/gym/subscription-type/protected/archive",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: subId }),
        }
      );
      if (!response.ok) throw new Error("Failed to archive");
      onDataChange();
      showFeedback("Subscription archived.", "success");
    } catch (err) {
      showFeedback(err.message, "error");
    }
  };

  const handleReactivate = async (subId) => {
    try {
      const response = await fetch(
        "/api/gym/subscription-type/protected/restore",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: subId }),
        }
      );
      if (!response.ok) throw new Error("Failed to restore");
      onDataChange();
      showFeedback("Subscription restored.", "success");
    } catch (err) {
      showFeedback(err.message, "error");
    }
  };

  const handlePermanentDelete = (sub) => {
    showConfirmation({
      title: "Confirm Permanent Deletion",
      children: (
        <p>
          Are you sure you want to permanently delete{" "}
          <strong>{sub.name}</strong>? This action cannot be undone. This option
          is only available if the subscription is not in use by any member.
        </p>
      ),
      onConfirm: async () => {
        closeConfirmation();
        try {
          const response = await fetch(
            "/api/gym/subscription-type/protected/delete",
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: sub.id }),
            }
          );
          if (!response.ok) throw new Error(await response.text());
          onDataChange();
          showFeedback("Subscription permanently deleted.", "success");
        } catch (err) {
          showFeedback(err.message, "error");
        }
      },
      confirmText: "Delete Forever",
      confirmColor: "bg-red-600",
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={closeConfirmation}
        {...confirmation}
      />
      <h3 className="text-xl font-bold text-gray-900">
        Manage Subscription Types
      </h3>

      <details className="mt-4 group">
        <summary className="flex items-center gap-2 p-2 font-semibold text-indigo-600 rounded-md cursor-pointer hover:bg-indigo-50">
          <HiPlusCircle className="w-6 h-6" /> Add New Subscriptions
        </summary>
        <form
          onSubmit={handleCreateSubscriptions}
          className="p-4 mt-2 space-y-4 border-t"
        >
          <input
            value={baseName}
            onChange={(e) => setBaseName(e.target.value)}
            placeholder="Base Name (e.g., Bronze, Silver)"
            required
            className="w-full form-input"
          />
          <h4 className="text-sm font-semibold">Variants:</h4>
          {variants.map((variant, index) => (
            <div
              key={index}
              className="flex flex-wrap items-center gap-2 p-2 border rounded-md bg-gray-50"
            >
              <input
                type="number"
                placeholder="Duration"
                value={variant.durationValue}
                onChange={(e) =>
                  handleVariantChange(index, "durationValue", e.target.value)
                }
                required
                className="flex-grow form-input"
                min="1"
              />
              <select
                value={variant.durationUnit}
                onChange={(e) =>
                  handleVariantChange(index, "durationUnit", e.target.value)
                }
                required
                className="flex-grow form-select"
              >
                <option value="DAY">Day(s)</option>
                <option value="WEEK">Week(s)</option>
                <option value="MONTH">Month(s)</option>
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Price (€)"
                value={variant.price}
                onChange={(e) =>
                  handleVariantChange(index, "price", e.target.value)
                }
                required
                className="flex-grow form-input"
                min="0"
              />
              <button
                type="button"
                onClick={() => handleRemoveVariant(index)}
                className="p-1 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600"
                disabled={variants.length <= 1}
              >
                <HiTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddVariant}
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            + Add another variant
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary"
          >
            {isLoading
              ? "Creating..."
              : `Create ${variants.length} Subscription(s)`}
          </button>
        </form>
      </details>

      <div className="mt-6 border-b border-gray-200">
        <nav className="flex -mb-px space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("active")}
            className={`${
              activeTab === "active"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
          >
            Active ({activeSubscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab("archived")}
            className={`${
              activeTab === "archived"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
          >
            Archived ({archivedSubscriptions.length})
          </button>
        </nav>
      </div>
      <div className="mt-4">
        {activeTab === "active" && (
          <ul className="space-y-2">
            {activeSubscriptions.map((sub) => {
              const displayName = `${sub.name} - ${
                sub.durationValue
              } ${sub.durationUnit.toLowerCase()}(s)`;
              return (
                <li
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-md bg-gray-50"
                >
                  <p className="font-medium text-gray-800">
                    {displayName}{" "}
                    <span className="text-gray-500">({sub.price}€)</span>
                  </p>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => openEditModal(sub)}
                      className="text-gray-400 hover:text-indigo-600"
                    >
                      <HiPencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleArchive(sub.id)}
                      className="text-gray-400 hover:text-yellow-600"
                    >
                      <HiArchiveBox className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {activeTab === "archived" && (
          <ul className="space-y-2">
            {archivedSubscriptions.map((sub) => {
              const displayName = `${sub.name} - ${
                sub.durationValue
              } ${sub.durationUnit.toLowerCase()}(s)`;
              return (
                <li
                  key={sub.id}
                  className="flex items-center justify-between p-3 bg-gray-100 rounded-md"
                >
                  <p className="text-gray-500 italic">{displayName}</p>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleReactivate(sub.id)}
                      className="text-gray-400 hover:text-green-600"
                    >
                      <HiArrowPath className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(sub)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {isEditModalOpen && editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <form
            onSubmit={handleUpdate}
            className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold">Edit Subscription Type</h3>
            <div>
              <label className="block text-sm font-medium">Base Name</label>
              <input
                value={editingSub.name}
                onChange={(e) => handleEditChange("name", e.target.value)}
                required
                className="w-full mt-1 form-input"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium">Duration</label>
                <input
                  type="number"
                  value={editingSub.durationValue}
                  onChange={(e) =>
                    handleEditChange("durationValue", e.target.value)
                  }
                  required
                  className="w-full mt-1 form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Unit</label>
                <select
                  value={editingSub.durationUnit}
                  onChange={(e) =>
                    handleEditChange("durationUnit", e.target.value)
                  }
                  required
                  className="w-full mt-1 form-select"
                >
                  <option value="DAY">Day(s)</option>
                  <option value="WEEK">Week(s)</option>
                  <option value="MONTH">Month(s)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Price (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingSub.price}
                  onChange={(e) => handleEditChange("price", e.target.value)}
                  required
                  className="w-full mt-1 form-input"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                value={editingSub.description ?? ""}
                onChange={(e) =>
                  handleEditChange("description", e.target.value)
                }
                className="w-full mt-1 form-textarea"
              ></textarea>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end pt-4 space-x-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ========================================================
// Componente #2: Form di Aggiunta Membro
// ========================================================
function AddMemberForm({
  activeSubscriptionTypes,
  onMemberAdded,
  showFeedback,
}) {
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
  const [isLoading, setIsLoading] = useState(false);

  const calculateEndDate = (startDate, durationValue, durationUnit) => {
    if (!startDate || !durationValue || !durationUnit) return "";
    const date = new Date(startDate);
    if (durationUnit === "DAY") date.setDate(date.getDate() + durationValue);
    if (durationUnit === "WEEK")
      date.setDate(date.getDate() + durationValue * 7);
    if (durationUnit === "MONTH")
      date.setMonth(date.getMonth() + durationValue);
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
    try {
      const response = await fetch("/api/gym/member/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(await response.text());
      showFeedback(
        `Member ${formData.firstName} added! An onboarding email has been sent.`,
        "success"
      );
      setFormData(initialFormState);
      if (onMemberAdded) onMemberAdded();
    } catch (err) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-gray-900">Add New Member</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full mt-1 form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full mt-1 form-input"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Email Address</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full mt-1 form-input"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full mt-1 form-select"
            >
              <option value="CLIENT">Client</option>
              <option value="TRAINER">Trainer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">
              Subscription Type
            </label>
            <select
              name="subscriptionTypeId"
              value={formData.subscriptionTypeId}
              onChange={handleChange}
              className="w-full mt-1 form-select"
              disabled={activeSubscriptionTypes.length === 0}
            >
              {activeSubscriptionTypes.length === 0 ? (
                <option>Please create an active subscription first</option>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Start Date</label>
            <input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full mt-1 form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">End Date</label>
            <input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full mt-1 form-input"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary"
        >
          {isLoading ? "Adding..." : "Add Member & Send Invite"}
        </button>
      </form>
    </div>
  );
}

// ========================================================
// NUOVO Componente #3: Lista e Gestione Membri
// ========================================================
function MemberManager({
  members,
  activeSubscriptions,
  onDataChange,
  showFeedback,
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [confirmation, setConfirmation] = useState({ isOpen: false });

  const openEditModal = (member) => {
    setEditingMember({
      userId: member.user.id,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      email: member.user.email,
      role: member.role,
      subscriptionTypeId: member.subscriptionTypeId,
      endDate: new Date(member.endDate).toISOString().split("T")[0],
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditingMember((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        userId: editingMember.userId,
        userData: {
          firstName: editingMember.firstName,
          lastName: editingMember.lastName,
        },
        membershipData: {
          role: editingMember.role,
          subscriptionTypeId: editingMember.subscriptionTypeId,
          endDate: editingMember.endDate,
        },
      };
      const response = await fetch("/api/gym/member/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await response.text());
      onDataChange();
      setIsEditModalOpen(false);
      showFeedback("Member updated successfully!", "success");
    } catch (err) {
      showFeedback(err.message, "error");
    }
  };

  const handleDelete = (member) => {
    setConfirmation({
      isOpen: true,
      title: "Remove Member",
      children: (
        <p>
          Are you sure you want to remove{" "}
          <strong>
            {member.user.firstName} {member.user.lastName}
          </strong>{" "}
          from your gym? Their user account will not be deleted.
        </p>
      ),
      onConfirm: async () => {
        try {
          const response = await fetch("/api/gym/member/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: member.user.id }),
          });
          if (!response.ok) throw new Error(await response.text());
          onDataChange();
          setConfirmation({ isOpen: false });
          showFeedback("Member removed.", "success");
        } catch (err) {
          showFeedback(err.message, "error");
        }
      },
      confirmText: "Remove",
      confirmColor: "bg-red-600",
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation({ isOpen: false })}
        {...confirmation}
      />
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <HiUserGroup className="w-6 h-6" /> Members
      </h3>
      <div className="mt-4 flow-root">
        <ul role="list" className="divide-y divide-gray-200">
          {members.map((member) => (
            <li
              key={member.user.id}
              className="flex justify-between gap-x-6 py-4"
            >
              <div className="flex min-w-0 gap-x-4">
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    {member.user.firstName} {member.user.lastName}
                  </p>
                  <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                    {member.user.email}
                  </p>
                </div>
              </div>
              <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                <p className="text-sm leading-6 text-gray-900">
                  {member.subscriptionType.name}
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Expires on{" "}
                  <time dateTime={member.endDate}>
                    {new Date(member.endDate).toLocaleDateString()}
                  </time>
                </p>
              </div>
              <div className="flex items-center gap-x-4">
                <button
                  onClick={() => openEditModal(member)}
                  className="text-gray-400 hover:text-indigo-600"
                >
                  <HiPencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(member)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <HiTrash className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isEditModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <form
            onSubmit={handleUpdate}
            className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold">Edit Member</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">First Name</label>
                <input
                  value={editingMember.firstName}
                  onChange={(e) =>
                    handleEditChange("firstName", e.target.value)
                  }
                  required
                  className="w-full mt-1 form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Last Name</label>
                <input
                  value={editingMember.lastName}
                  onChange={(e) => handleEditChange("lastName", e.target.value)}
                  required
                  className="w-full mt-1 form-input"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                value={editingMember.email}
                disabled
                className="w-full mt-1 form-input bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">
                  Subscription
                </label>
                <select
                  value={editingMember.subscriptionTypeId}
                  onChange={(e) =>
                    handleEditChange("subscriptionTypeId", e.target.value)
                  }
                  className="w-full mt-1 form-select"
                >
                  {activeSubscriptions.map((sub) => (
                    <option key={sub.id} value={sub.id}>{`${sub.name} - ${
                      sub.durationValue
                    } ${sub.durationUnit.toLowerCase()}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Expires On</label>
                <input
                  type="date"
                  value={editingMember.endDate}
                  onChange={(e) => handleEditChange("endDate", e.target.value)}
                  required
                  className="w-full mt-1 form-input"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4 space-x-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ========================================================
// Componente #4: Pagina Principale della Dashboard
// ========================================================
export default function GymDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Stati per i dati
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stato per le notifiche
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  const showToast = (message, type) =>
    setToast({ message, type, visible: true });

  // Funzione unificata per caricare tutti i dati della dashboard
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subsResponse, membersResponse] = await Promise.all([
        fetch("/api/gym/subscription-type/protected/get"),
        fetch("/api/gym/member/get"),
      ]);
      if (!subsResponse.ok || !membersResponse.ok)
        throw new Error("Failed to fetch dashboard data");
      const subsData = await subsResponse.json();
      const membersData = await membersResponse.json();
      setAllSubscriptions(subsData);
      setMembers(membersData);
    } catch (error) {
      console.error(error);
      showToast("Could not load gym data.", "error");
    } finally {
      setIsLoading(false);
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

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading Dashboard...
      </div>
    );
  }

  if (session && session.user.entityType === "gym") {
    const activeSubscriptions = allSubscriptions.filter((sub) => sub.isActive);
    return (
      <>
        {toast.visible && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClear={() => setToast({ ...toast, visible: false })}
          />
        )}
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm">
            {/* ... (Navbar, invariata) ... */}
          </header>
          <main className="p-4 mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h2>
            <div className="grid grid-cols-1 gap-8 mt-6 lg:grid-cols-5">
              <div className="flex flex-col gap-8 lg:col-span-2">
                <AddMemberForm
                  activeSubscriptionTypes={activeSubscriptions}
                  onMemberAdded={fetchData}
                  showFeedback={showToast}
                />
                <SubscriptionManager
                  allSubscriptions={allSubscriptions}
                  onDataChange={fetchData}
                  showFeedback={showToast}
                />
              </div>
              <div className="lg:col-span-3">
                <MemberManager
                  members={members}
                  activeSubscriptions={activeSubscriptions}
                  onDataChange={fetchData}
                  showFeedback={showToast}
                />
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }
  return null;
}
