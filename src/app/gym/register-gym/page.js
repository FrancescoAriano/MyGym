"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { debounce } from "lodash";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import {
  HiBuildingStorefront,
  HiEnvelope,
  HiLockClosed,
  HiPhone,
  HiMapPin,
} from "react-icons/hi2";

export default function RegisterGymPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    latitude: null,
    longitude: null,
  });

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const searchAddress = async (query) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    setIsSearchingAddress(true);
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=10&addressdetails=1`
      );
      const data = await response.json();
      const allowedTypes = [
        "administrative",
        "city",
        "town",
        "village",
        "suburb",
        "county",
        "state",
        "country",
      ];

      const filteredData = data.filter(
        (item) =>
          allowedTypes.includes(item.type) &&
          (item.addresstype === "city" ||
            item.addresstype === "town" ||
            item.addresstype === "village" ||
            item.class === "boundary")
      );

      setAddressSuggestions(filteredData.slice(0, 5));
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const debouncedSearch = useCallback(
    (query) => debounce(searchAddress, 500)(query),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setFormData((prev) => ({
      ...prev,
      address: newAddress,
      latitude: null,
      longitude: null,
    }));
    debouncedSearch(newAddress);
  };

  const selectAddress = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      address: suggestion.display_name,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
    }));
    setAddressSuggestions([]);
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

        <div className="relative">
          <Input
            name="address"
            type="text"
            value={formData.address}
            onChange={handleAddressChange}
            placeholder="Inizia a digitare l'indirizzo..."
            icon={HiMapPin}
            required
            autoComplete="off"
          />
          {isSearchingAddress && (
            <span className="absolute text-xs text-muted-foreground top-full">
              Ricerca in corso...
            </span>
          )}
          {addressSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {addressSuggestions.map((suggestion) => (
                <li
                  key={suggestion.place_id}
                  onClick={() => selectAddress(suggestion)}
                  className="p-3 text-sm cursor-pointer hover:bg-muted transition-colors text-foreground border-b border-border last:border-b-0"
                >
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-chart-3/10 border border-chart-3/20">
            <p className="text-sm text-chart-3">{success}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || success}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Registrazione..." : "Registra"}
        </Button>
      </form>

      <div className="text-center">
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
    </AuthLayout>
  );
}
