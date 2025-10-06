import { useState } from "react";
import { HiEye, HiEyeSlash } from "react-icons/hi2";

export function Input({ label, error, icon: Icon, className = "", ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = props.type === "password";

  // Gestisci i valori numerici vuoti per evitare NaN
  const handleChange = (e) => {
    if (props.type === "number" && e.target.value === "") {
      e.target.value = "";
    }
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const inputProps = { ...props };
  if (props.type === "number") {
    inputProps.onChange = handleChange;
  }

  // Se è un campo password e showPassword è true, cambia il type a text
  if (isPassword) {
    inputProps.type = showPassword ? "text" : "password";
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        )}
        <input
          className={`w-full ${Icon ? "pl-10" : "pl-3"} ${
            isPassword ? "pr-10" : "pr-3"
          } py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
            error ? "border-destructive focus:ring-destructive" : ""
          }`}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <HiEyeSlash className="h-5 w-5" />
            ) : (
              <HiEye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
          error ? "border-destructive focus:ring-destructive" : ""
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none ${
          error ? "border-destructive focus:ring-destructive" : ""
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
