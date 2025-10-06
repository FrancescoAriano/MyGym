"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  AddressAutocomplete,
  AlertMessage,
  useFormState,
} from "@/components/auth";
import {
  HiBuildingStorefront,
  HiEnvelope,
  HiLockClosed,
  HiPhone,
} from "react-icons/hi2";

export default function RegisterGymPage() {
  const {
    formData,
    setFormData,
    error,
    setError,
    success,
    setSuccess,
    isLoading,
    setIsLoading,
    handleChange,
  } = useFormState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    latitude: null,
    longitude: null,
  });
  const router = useRouter();

  const handleAddressSelect = ({ address, latitude, longitude }) => {
    setFormData((prev) => ({
      ...prev,
      address,
      latitude,
      longitude,
    }));
  };

  const handleAddressChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      address: value,
      latitude: null,
      longitude: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!formData.latitude || !formData.longitude) {
      setError(
        "Seleziona un indirizzo valido dai suggerimenti per impostare la posizione della tua palestra."
      );
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/gym/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const responseText = await response.text();
      if (!response.ok) throw new Error(responseText);

      setSuccess(`Registrato! Sarai reindirizzato alla pagina di login.`);
      setTimeout(() => {
        router.push("/login");
      }, 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Registra la tua Palestra"
      subtitle="Inizia a gestire la tua palestra con MyGym"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nome della Palestra"
          icon={HiBuildingStorefront}
          required
        />

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

        <Input
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="Numero di Telefono"
          icon={HiPhone}
        />

        <AddressAutocomplete
          value={formData.address}
          onChange={handleAddressChange}
          onSelect={handleAddressSelect}
          required
        />

        <AlertMessage message={error} type="error" />
        <AlertMessage message={success} type="success" />

        <Button
          type="submit"
          disabled={isLoading || success}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Registrazione..." : "Registra"}
        </Button>
      </form>

      <div>
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Hai già un account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Accedi qui
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
