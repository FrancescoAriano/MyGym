// app/verify-email/page.js
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function VerificationComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'expired', 'error'
  const [message, setMessage] = useState("Verifying your email address...");
  const [emailForResend, setEmailForResend] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
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

        if (response.ok) {
          setStatus("success");
          setMessage(responseText);
        } else if (response.status === 400 || response.status === 410) {
          setStatus("expired");
          setMessage(responseText);
        } else {
          throw new Error(responseText);
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "An unexpected error occurred.");
      }
    };

    verifyToken();
  }, [token]);

  const handleResend = async () => {
    if (!emailForResend) {
      setMessage("Please enter your email address to resend the link.");
      return;
    }
    setStatus("verifying"); // Show loading state
    setMessage("Sending a new link...");
    try {
      const response = await fetch("/api/auth/gym/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailForResend }),
      });
      const responseText = await response.text();
      if (!response.ok) throw new Error(responseText);

      setStatus("success");
      setMessage(responseText);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Failed to resend the link.");
    }
  };

  return (
    <div className="text-center">
      {status === "verifying" && (
        <h2 className="text-2xl font-bold text-gray-900">Verifying...</h2>
      )}
      {status === "success" && (
        <h2 className="text-2xl font-bold text-green-600">Success!</h2>
      )}
      {status === "expired" && (
        <h2 className="text-2xl font-bold text-yellow-600">Link Expired</h2>
      )}
      {status === "error" && (
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
      )}

      <p className="mt-4 text-gray-600">{message}</p>

      {status === "success" && (
        <Link
          href="/login"
          className="inline-block px-6 py-2 mt-6 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Go to Login
        </Link>
      )}

      {status === "expired" && (
        <div className="mt-6 space-y-4">
          <p>Please enter your email to receive a new verification link.</p>
          <input
            type="email"
            value={emailForResend}
            onChange={(e) => setEmailForResend(e.target.value)}
            placeholder="Enter your gym's registration email"
            className="w-full max-w-xs px-4 py-2 mx-auto text-gray-900 bg-gray-200 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleResend}
            className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Resend Link
          </button>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <Suspense fallback={<div>Loading...</div>}>
          <VerificationComponent />
        </Suspense>
      </div>
    </div>
  );
}
