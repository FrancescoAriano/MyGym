"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { HiExclamationCircle } from "react-icons/hi2";

/**
 * Componente per visualizzare abbonamenti in scadenza
 * Pattern GRASP: High Cohesion - si occupa solo di mostrare membri in scadenza
 */
export function ExpiringMemberships({ members, maxItems = 5 }) {
  const expiringMembers = members
    .filter((m) => {
      const daysUntilExpiry = Math.ceil(
        (new Date(m.endDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
    })
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
    .slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HiExclamationCircle className="h-5 w-5 text-destructive" />
          Abbonamenti in Scadenza
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[200px] overflow-y-auto">
          {expiringMembers.map((member) => {
            const daysLeft = Math.ceil(
              (new Date(member.endDate) - new Date()) / (1000 * 60 * 60 * 24)
            );
            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {member.user.firstName} {member.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.subscriptionType.name}
                  </p>
                </div>
                <span className="text-sm font-medium text-destructive">
                  {daysLeft} {daysLeft === 1 ? "giorno" : "giorni"}
                </span>
              </div>
            );
          })}
          {expiringMembers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nessun abbonamento in scadenza
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
