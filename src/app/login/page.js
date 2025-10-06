"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  EntityTypeSelector,
  AlertMessage,
  useFormState,
} from "@/components/auth";
import { HiEnvelope, HiLockClosed } from "react-icons/hi2";

export default function LoginPage() {
  const { formData, error, setError, isLoading, setIsLoading, handleChange } =
    useFormState({
      email: "",
      password: "",
    });
  const [entityType, setEntityType] = useState("user");
  const router = useRouter();

  const handleEntityTypeChange = (type) => {
    setEntityType(type);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
      entity: entityType,
    });

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.ok) {
      if (entityType === "gym") {
        router.push("/gym/dashboard/home");
      } else {
        // Per gli utenti, verifica se sono trainer
        const sessionResponse = await fetch("/api/auth/session");
        const sessionData = await sessionResponse.json();

        if (sessionData?.user?.role === "TRAINER") {
          router.push("/trainer/dashboard");
        } else {
          router.push("/user/dashboard");
        }
      }
    }
  };

  return (
    <AuthLayout title="Bentornato" subtitle="Accedi al tuo account MyGym">
      <EntityTypeSelector
        value={entityType}
        onChange={handleEntityTypeChange}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          icon={HiEnvelope}
          required
        />
        <Input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          icon={HiLockClosed}
          required
        />

        <AlertMessage message={error} type="error" />

        <Button type="submit" disabled={isLoading} className="w-full" size="lg">
          {isLoading ? "Accesso in corso..." : "Accedi"}
        </Button>
      </form>

      <div>
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Non hai un account palestra?{" "}
            <Link
              href="/gym/register-gym"
              className="font-medium text-primary hover:underline"
            >
              Registrati qui
            </Link>
          </p>
        </div>

        <div className="my-4 border-t  bborder-border w-60 mx-auto" />

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Scopri di più su MyGym!{" "}
            <Link href="/" className="font-medium text-primary hover:underline">
              Torna alla Home
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
