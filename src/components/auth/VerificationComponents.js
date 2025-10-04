"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Componente per lo stato di verifica email
 * Pattern GRASP: Information Expert - gestisce la logica di verifica
 * Pattern GoF: State - gestisce diversi stati (verifying, success, expired, error)
 */
export function VerificationStatus({ token, onStatusChange }) {
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    if (!token) {
      const errorState = {
        status: "error",
        message: "No verification token found in the link.",
      };
      setStatus(errorState.status);
      setMessage(errorState.message);
      onStatusChange?.(errorState);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch("/api/auth/gym/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const responseText = await response.text();
        let newStatus;

        if (response.ok) {
          newStatus = { status: "success", message: responseText };
        } else if (response.status === 400 || response.status === 410) {
          newStatus = { status: "expired", message: responseText };
        } else {
          throw new Error(responseText);
        }

        setStatus(newStatus.status);
        setMessage(newStatus.message);
        onStatusChange?.(newStatus);
      } catch (err) {
        const errorState = {
          status: "error",
          message: err.message || "An unexpected error occurred.",
        };
        setStatus(errorState.status);
        setMessage(errorState.message);
        onStatusChange?.(errorState);
      }
    };

    verifyToken();
  }, [token, onStatusChange]);

  const statusConfig = {
    verifying: {
      title: "Verifying...",
      color: "text-primary",
      icon: "⏳",
    },
    success: {
      title: "Success!",
      color: "text-chart-3",
      icon: "✓",
    },
    expired: {
      title: "Link Expired",
      color: "text-chart-4",
      icon: "⚠",
    },
    error: {
      title: "Error",
      color: "text-destructive",
      icon: "✗",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="text-center space-y-4">
      <div className={`text-6xl ${config.color}`}>{config.icon}</div>
      <h2 className={`text-3xl font-bold ${config.color}`}>{config.title}</h2>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * Componente per il resend della email di verifica
 */
export function ResendVerificationForm({ onResend }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    await onResend(email);
    setIsLoading(false);
  };

  return (
    <div className="mt-6 space-y-4">
      <p className="text-muted-foreground">
        Please enter your email to receive a new verification link.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your gym's registration email"
          className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Resend Link"}
        </button>
      </form>
    </div>
  );
}

/**
 * Skeleton per la pagina di verifica
 */
export function VerificationSkeleton() {
  return (
    <div className="text-center space-y-4">
      <Skeleton className="w-16 h-16 mx-auto rounded-full" />
      <Skeleton className="h-8 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
    </div>
  );
}
