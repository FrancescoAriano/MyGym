"use client";

import { useState, useRef, useEffect } from "react";
import { HiChevronDown, HiCheck } from "react-icons/hi2";

/**
 * Componente Select personalizzato con stile moderno
 * @param {Object} props
 * @param {Array} props.options - Array di opzioni {value, label}
 * @param {string} props.value - Valore selezionato
 * @param {Function} props.onChange - Callback quando cambia selezione
 * @param {string} props.placeholder - Testo placeholder
 * @param {string} props.label - Label del select
 * @param {boolean} props.required - Se campo obbligatorio
 * @param {boolean} props.disabled - Se disabilitato
 */
export function Select({
  options = [],
  value,
  onChange,
  placeholder = "Seleziona un'opzione",
  label,
  required = false,
  disabled = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div ref={selectRef} className="relative">
        {/* Selected Value Display */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 text-left
            bg-background border border-border rounded-lg
            flex items-center justify-between
            transition-all duration-200
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
            }
            ${isOpen ? "border-primary ring-2 ring-primary/20" : ""}
          `}
        >
          <span
            className={
              selectedOption ? "text-foreground" : "text-muted-foreground"
            }
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <HiChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                Nessuna opzione disponibile
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full px-4 py-2.5 text-left flex items-center justify-between
                    transition-colors duration-150
                    ${
                      option.value === value
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted"
                    }
                  `}
                >
                  <span>{option.label}</span>
                  {option.value === value && (
                    <HiCheck className="h-5 w-5 text-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
