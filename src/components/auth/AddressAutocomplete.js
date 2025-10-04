"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { HiMapPin } from "react-icons/hi2";
import { debounce } from "lodash";

/**
 * Componente per la ricerca e selezione di indirizzi
 * Pattern GRASP: Information Expert - gestisce la logica di geocoding
 * Pattern GoF: Observer - notifica i cambiamenti al componente padre
 */
export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Inizia a digitare l'indirizzo...",
  required = false,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchAddress = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
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

      setSuggestions(filteredData.slice(0, 5));
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(searchAddress, 500), []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    debouncedSearch(newValue);
  };

  const handleSelect = (suggestion) => {
    onSelect({
      address: suggestion.display_name,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
    });
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <Input
        name="address"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        icon={HiMapPin}
        required={required}
        autoComplete="off"
      />
      {isSearching && (
        <span className="absolute text-xs text-muted-foreground top-full mt-1">
          Ricerca in corso...
        </span>
      )}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion)}
              className="p-3 text-sm cursor-pointer hover:bg-muted transition-colors text-foreground border-b border-border last:border-b-0"
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
