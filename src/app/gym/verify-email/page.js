// app/verify-email/page.js
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  VerificationStatus,
  ResendVerificationForm,
  VerificationSkeleton,
} from "@/components/auth";
import { Button } from "@/components/ui/Button";

function VerificationComponent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [currentStatus, setCurrentStatus] = useState(null);
  const [resendMessage, setResendMessage] = useState("");

  const handleResend = async (email) => {
    setResendMessage("Sending a new link...");
    try {
      const response = await fetch("/api/auth/gym/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const responseText = await response.text();
      if (!response.ok) throw new Error(responseText);

      setResendMessage(responseText);
      setCurrentStatus({ status: "success", message: responseText });
    } catch (err) {
      setResendMessage(err.message || "Failed to resend the link.");
      setCurrentStatus({
        status: "error",
        message: err.message || "Failed to resend the link.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <VerificationStatus token={token} onStatusChange={setCurrentStatus} />

      {currentStatus?.status === "success" && (
        <Link href="/login" className="block">
          <Button className="w-full" size="lg">
            Go to Login
          </Button>
        </Link>
      )}

      {currentStatus?.status === "expired" && !resendMessage && (
        <ResendVerificationForm onResend={handleResend} />
      )}

      {resendMessage && (
        <div className="text-center text-sm text-muted-foreground">
          {resendMessage}
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 bg-card rounded-2xl shadow-xl border border-border">
        <Suspense fallback={<VerificationSkeleton />}>
          <VerificationComponent />
        </Suspense>
      </div>
    </div>
  );
}
