"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { HiEnvelope, HiLockClosed } from "react-icons/hi2";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [entityType, setEntityType] = useState("user"); // 'user' o 'gym'
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Clear error when the user edits any input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // update form
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // clear any existing error
    if (error) setError("");
  };

  const handleEntityTypeChange = (type) => {
    if (type === entityType) return;
    setEntityType(type);
    // clear any existing error when switching between user/gym
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Usiamo la funzione signIn di NextAuth
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
      // Se il login ha successo, reindirizziamo
      if (entityType === "gym") {
        router.push("/gym/dashboard/home");
      } else {
        router.push("/user/dashboard");
      }
    }
  };

  return (
    <AuthLayout title="Bentornato" subtitle="Accedi al tuo account MyGym">
      {/* Selettore per tipo di entità */}
      <div className="flex p-2 space-x-2 bg-muted/50 rounded-xl">
        <button
          type="button"
          onClick={() => handleEntityTypeChange("user")}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
            entityType === "user"
              ? "bg-background text-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sono un Utente
        </button>
        <button
          type="button"
          onClick={() => handleEntityTypeChange("gym")}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
            entityType === "gym"
              ? "bg-background text-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sono una Palestra
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email"
          icon={HiEnvelope}
          required
        />
        <Input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Password"
          icon={HiLockClosed}
          required
        />

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full" size="lg">
          {isLoading ? "Accesso in corso..." : "Accedi"}
        </Button>
      </form>

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
    </AuthLayout>
  );
}
