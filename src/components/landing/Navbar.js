"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { HiMoon, HiSun } from "react-icons/hi2";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                M
              </span>
            </div>
            <span className="text-xl font-bold text-foreground">MyGym</span>
          </div>
          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <HiSun className="w-5 h-5" />
                ) : (
                  <HiMoon className="w-5 h-5" />
                )}
              </button>
            )}
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-foreground border border-primary rounded-lg hover:text-primary-foreground hover:bg-primary transition-color"
            >
              Accedi
            </Link>
            <Link
              href="/gym/register-gym"
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground border border-primary rounded-lg hover:text-foreground hover:bg-primary-foreground transition-all hidden sm:inline-flex"
            >
              Registra Palestra
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
