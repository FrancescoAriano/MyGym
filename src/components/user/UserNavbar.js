"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { HiArrowRightOnRectangle } from "react-icons/hi2";

/**
 * Navbar per l'area utente
 * Pattern GRASP: High Cohesion - gestisce solo la navigazione utente
 * @param {string} userName - Nome dell'utente o email
 */
export function UserNavbar({ userName }) {
  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary">
              MyGym Member Area
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Benvenuto,{" "}
              <span className="text-foreground font-medium">{userName}</span>
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2"
            >
              <HiArrowRightOnRectangle className="h-4 w-4" />
              <span className="hidden sm:inline">Esci</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
