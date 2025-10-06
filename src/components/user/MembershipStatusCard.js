"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/formatters";
import {
  HiCalendar,
  HiCreditCard,
  HiCheckCircle,
  HiExclamationCircle,
  HiUser,
} from "react-icons/hi2";

/**
 * Card per visualizzare lo stato dell'abbonamento utente
 * Pattern GRASP: Information Expert - gestisce la visualizzazione dei dati abbonamento
 * @param {object} membership - Dati dell'abbonamento {type, status, startDate, endDate, price}
 * @param {string} userName - Nome dell'utente
 */
export function MembershipStatusCard({ membership, userName }) {
  if (!membership) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Il tuo Abbonamento
          </h3>
          <p className="text-muted-foreground">
            Nessun abbonamento attivo al momento.
          </p>
        </div>
      </Card>
    );
  }

  const { type, status, startDate, endDate, price } = membership;
  const isActive = status === "active";
  const isExpiringSoon =
    endDate && new Date(endDate) - new Date() < 7 * 24 * 60 * 60 * 1000;

  return (
    <Card>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <HiCreditCard className="h-5 w-5 text-primary" />
            Il tuo Abbonamento
          </h3>
          <Badge variant={isActive ? "success" : "default"}>
            {isActive ? (
              <>
                <HiCheckCircle className="h-4 w-4 mr-1" />
                Attivo
              </>
            ) : (
              "Scaduto"
            )}
          </Badge>
        </div>

        <div className="space-y-3">
          {userName && (
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <HiUser className="h-4 w-4" />
                Account
              </p>
              <p className="text-base font-medium text-foreground">
                {userName}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground">Tipo abbonamento</p>
            <p className="text-base font-medium text-foreground">{type}</p>
          </div>

          {startDate && (
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <HiCalendar className="h-4 w-4" />
                Data inizio
              </p>
              <p className="text-base text-foreground">
                {formatDate(startDate)}
              </p>
            </div>
          )}

          {endDate && (
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <HiCalendar className="h-4 w-4" />
                Data scadenza
              </p>
              <p className="text-base text-foreground">{formatDate(endDate)}</p>
              {isExpiringSoon && isActive && (
                <p className="text-sm text-warning flex items-center gap-1 mt-1">
                  <HiExclamationCircle className="h-4 w-4" />
                  In scadenza a breve
                </p>
              )}
            </div>
          )}

          {price && (
            <div>
              <p className="text-sm text-muted-foreground">Costo</p>
              <p className="text-xl font-bold text-primary">
                €{formatPrice(price)}/mese
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
