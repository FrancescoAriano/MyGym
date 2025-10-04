"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AlertMessage } from "./FormComponents";

/**
 * Form per impostare una nuova password
 * Pattern GRASP: High Cohesion - gestisce solo la logica del form password
 * @param {function} onSubmit - Callback per il submit con (password)
 * @param {boolean} isLoading - Stato di caricamento
 * @param {string} errorMessage - Messaggio di errore da visualizzare
 */
export function SetPasswordForm({ onSubmit, isLoading, errorMessage }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    // Validazione
    if (password !== confirmPassword) {
      setLocalError("Le password non coincidono.");
      return;
    }
    if (password.length < 8) {
      setLocalError("La password deve essere di almeno 8 caratteri.");
      return;
    }

    onSubmit(password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-foreground">
        Imposta la tua Password
      </h2>

      <div>
        <Input
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nuova Password"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Input
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Conferma Password"
          required
          disabled={isLoading}
        />
      </div>

      {(localError || errorMessage) && (
        <AlertMessage type="error" message={localError || errorMessage} />
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Impostazione Password..." : "Imposta Password"}
      </Button>
    </form>
  );
}

/**
 * Form per richiedere nuovo link di attivazione
 * Pattern GRASP: High Cohesion - gestisce solo la logica del resend
 * @param {function} onResend - Callback per il resend con (email)
 * @param {boolean} isLoading - Stato di caricamento
 * @param {string} message - Messaggio da visualizzare
 */
export function ResendActivationForm({ onResend, isLoading, message }) {
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState("");

  const handleResend = (e) => {
    e.preventDefault();
    setLocalError("");

    if (!email) {
      setLocalError("Inserisci la tua email per ricevere un nuovo link.");
      return;
    }

    onResend(email);
  };

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-2xl font-bold text-warning">
        Link Scaduto o Non Valido
      </h2>

      {message && <p className="text-muted-foreground">{message}</p>}

      <div className="space-y-4 mt-6">
        <p className="text-foreground">
          Inserisci la tua email per ricevere un nuovo link di attivazione.
        </p>

        <form onSubmit={handleResend} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Inserisci la tua email di registrazione"
            disabled={isLoading}
            className="max-w-xs mx-auto"
          />

          {localError && <AlertMessage type="error" message={localError} />}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Invio in corso..." : "Invia Nuovo Link"}
          </Button>
        </form>
      </div>
    </div>
  );
}

/**
 * Messaggio di successo per set password completato
 */
export function SetPasswordSuccess({ message }) {
  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold text-success">
        Operazione Completata!
      </h2>
      <p className="text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground">
        Verrai reindirizzato alla pagina di login...
      </p>
    </div>
  );
}

/**
 * Messaggio di errore per set password
 */
export function SetPasswordError({ message }) {
  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold text-destructive">Errore</h2>
      <p className="text-muted-foreground">{message}</p>
      <Button
        variant="outline"
        onClick={() => (window.location.href = "/")}
        className="mt-4"
      >
        Torna alla Home
      </Button>
    </div>
  );
}
