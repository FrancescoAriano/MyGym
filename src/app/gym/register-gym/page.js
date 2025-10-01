"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";

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

  const debouncedSearch = useCallback(debounce(searchAddress, 500), [
    searchAddress,
  ]);

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
        "Please select a valid address from the suggestions to set your gym's location."
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

      setSuccess(`${responseText} You will be redirected to the login page.`);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Register Your Gym
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Gym Name"
            required
            className="w-full px-4 py-2 text-gray-900 bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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
          <input
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full px-4 py-2 text-gray-900 bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="relative">
            <input
              name="address"
              type="text"
              value={formData.address}
              onChange={handleAddressChange}
              placeholder="Start typing gym address..."
              required
              autoComplete="off"
              className="w-full px-4 py-2 text-gray-900 bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {isSearchingAddress && (
              <span className="absolute text-xs text-gray-500 top-12">
                Searching...
              </span>
            )}
            {addressSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 overflow-hidden bg-white border border-gray-300 rounded-md shadow-lg">
                {addressSuggestions.map((suggestion) => (
                  <li
                    key={suggestion.place_id}
                    onClick={() => selectAddress(suggestion)}
                    className="p-2 text-sm cursor-pointer hover:bg-gray-100"
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-center text-red-600">{error}</p>
        )}
        {success && (
          <p className="mt-4 text-sm text-center text-green-600">{success}</p>
        )}
      </div>
    </div>
  );
}
