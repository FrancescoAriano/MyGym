// app/user/set-password/page.js
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import {
  SetPasswordForm,
  ResendActivationForm,
  SetPasswordSuccess,
  SetPasswordError,
} from "@/components/auth";

/**
 * Componente interno per gestire la logica del set password
 * Pattern GRASP: Controller - coordina le operazioni di set password
 */
function SetPasswordComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // 'loading', 'ready', 'expired', 'success', 'error'
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setStatus("ready");
    } else {
      setStatus("error");
      setMessage(
        "Nessun token di attivazione trovato nel link. Controlla l'URL."
      );
    }
  }, [token]);

  const handlePasswordSubmit = async (password) => {
    setIsLoading(true);
    setMessage("");
    setStatus("loading");

    try {
      const response = await fetch("/api/auth/user/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const responseText = await response.text();

      if (response.ok) {
        setStatus("success");
        setMessage(responseText);
        setTimeout(() => router.push("/login"), 3000);
      } else if (response.status === 410) {
        setStatus("expired");
        setMessage(responseText);
      } else {
        throw new Error(responseText);
      }
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Impossibile impostare la password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async (email) => {
    setIsLoading(true);
    setStatus("loading");
    setMessage("Invio nuovo link in corso...");

    try {
      const response = await fetch("/api/auth/user/resend-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const responseText = await response.text();

      if (!response.ok) throw new Error(responseText);

      setStatus("success");
      setMessage(`${responseText} Controlla la tua casella email.`);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Impossibile inviare il link.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <Loading />
            <p className="mt-4 text-muted-foreground">
              {message || "Caricamento..."}
            </p>
          </div>
        );
      case "success":
        return <SetPasswordSuccess message={message} />;
      case "expired":
        return (
          <ResendActivationForm
            onResend={handleResend}
            isLoading={isLoading}
            message={message}
          />
        );
      case "error":
        return <SetPasswordError message={message} />;
      case "ready":
        return (
          <SetPasswordForm
            onSubmit={handlePasswordSubmit}
            isLoading={isLoading}
            errorMessage={message}
          />
        );
      default:
        return null;
    }
  };

  return renderContent();
}

/**
 * Pagina per impostare la password utente
 * Pattern GRASP: Low Coupling - delega la logica al componente interno
 */
export default function SetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-8">
                <Loading />
              </div>
            }
          >
            <SetPasswordComponent />
          </Suspense>
        </div>
      </Card>
    </div>
  );
}
