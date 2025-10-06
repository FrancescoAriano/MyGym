"use client";

import { useTheme } from "next-themes";
import { HiMoon, HiSun } from "react-icons/hi2";
import { useEffect, useState } from "react";

export function AuthLayout({ children, title, subtitle }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4 relative">
      {/* Theme Toggle */}
      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="fixed top-4 right-4 p-3 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-200 text-foreground"
          aria-label="Toggle theme"
        >
          <div className="relative w-6 h-6">
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${
                theme === "dark" ? "opacity-100" : "opacity-0"
              }`}
            >
              <HiSun className="w-6 h-6" />
            </div>
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${
                theme === "dark" ? "opacity-0" : "opacity-100"
              }`}
            >
              <HiMoon className="w-6 h-6" />
            </div>
          </div>
        </button>
      )}

      {/* Auth Card */}
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl border border-border shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            )}
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
