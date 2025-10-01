// app/set-password/page.js
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function SetPasswordComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // 'loading', 'ready', 'expired', 'success', 'error'
  const [message, setMessage] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailForResend, setEmailForResend] = useState("");

  useEffect(() => {
    if (token) {
      setStatus("ready");
    } else {
      setStatus("error");
      setMessage(
        "No activation token found in the link. Please check the URL."
      );
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validazione
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setStatus("error");
      return;
    }
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      setStatus("error");
      return;
    }

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
        // 410 Gone, il token è scaduto
        setStatus("expired");
        setMessage(responseText);
      } else {
        throw new Error(responseText);
      }
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Failed to set password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!emailForResend) {
      setMessage("Please enter your email to receive a new link.");
      setStatus("expired"); // Rimane nello stato expired ma mostra il messaggio
      return;
    }
    setIsLoading(true);
    setStatus("loading");
    setMessage("Sending a new link...");
    try {
      const response = await fetch("/api/auth/user/resend-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailForResend }),
      });
      const responseText = await response.text();
      if (!response.ok) throw new Error(responseText);

      setStatus("success");
      setMessage(`${responseText} Please check your inbox.`);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Failed to resend the link.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return <p className="text-center">{message || "Loading..."}</p>;
      case "success":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600">Success!</h2>
            <p className="mt-4 text-gray-600">{message}</p>
            <p className="mt-2 text-sm">Redirecting you to the login page...</p>
          </div>
        );
      case "expired":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-yellow-600">
              Link Expired or Invalid
            </h2>
            <p className="mt-4 text-gray-600">{message}</p>
            <div className="mt-6 space-y-4">
              <p>Please enter your email to receive a new setup link.</p>
              <input
                type="email"
                value={emailForResend}
                onChange={(e) => setEmailForResend(e.target.value)}
                placeholder="Enter your registration email"
                className="w-full max-w-xs px-4 py-2 mx-auto text-gray-900 bg-gray-200 border border-gray-300 rounded-md"
              />
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {isLoading ? "Sending..." : "Resend Link"}
              </button>
            </div>
          </div>
        );
      case "error":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Error</h2>
            <p className="mt-4 text-gray-600">{message}</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 mt-6 font-semibold text-indigo-600"
            >
              Go to Homepage
            </Link>
          </div>
        );
      case "ready":
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">
              Set Your Password
            </h2>
            <div>
              <input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                required
                className="w-full px-4 py-2 text-gray-900 bg-gray-200 border rounded-md"
              />
            </div>
            <div>
              <input
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                required
                className="w-full px-4 py-2 text-gray-900 bg-gray-200 border rounded-md"
              />
            </div>
            {message && (
              <p className="text-sm text-center text-red-600">{message}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {isLoading ? "Setting Password..." : "Set Password"}
            </button>
          </form>
        );
    }
  };

  return renderContent();
}

export default function SetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <Suspense fallback={<div>Loading...</div>}>
          <SetPasswordComponent />
        </Suspense>
      </div>
    </div>
  );
}
