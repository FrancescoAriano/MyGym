"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [entityType, setEntityType] = useState("user"); // 'user' o 'gym'
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Usiamo la funzione signIn di NextAuth
    const result = await signIn("credentials", {
      redirect: false, // Non reindirizzare automaticamente, gestiamo noi la risposta
      email: formData.email,
      password: formData.password,
      entity: entityType,
    });

    setIsLoading(false);

    if (result.error) {
      // Se c'è un errore, NextAuth lo mette in result.error
      setError(result.error);
    } else if (result.ok) {
      // Se il login ha successo, reindirizziamo
      if (entityType === "gym") {
        router.push("/dashboard/gym");
      } else {
        router.push("/dashboard/user"); // O un'altra pagina per gli utenti
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Log In to MyGym
        </h2>

        {/* Selettore per tipo di entità */}
        <div className="flex justify-center p-1 space-x-1 bg-gray-200 rounded-md">
          <button
            onClick={() => setEntityType("user")}
            className={`w-full px-4 py-2 text-sm font-medium rounded-md ${
              entityType === "user"
                ? "bg-white text-indigo-700 shadow"
                : "text-gray-600"
            }`}
          >
            I am a User
          </button>
          <button
            onClick={() => setEntityType("gym")}
            className={`w-full px-4 py-2 text-sm font-medium rounded-md ${
              entityType === "gym"
                ? "bg-white text-indigo-700 shadow"
                : "text-gray-600"
            }`}
          >
            I am a Gym
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            required
            className="w-full px-4 py-2 text-gray-900 bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full px-4 py-2 text-gray-900 bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-center text-red-600">{error}</p>
        )}
        <p className="text-sm text-center text-gray-600">
          Don't have a gym account?{" "}
          <a
            href="/gym/register-gym"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
