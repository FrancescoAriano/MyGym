"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UserNavbar } from "@/components/user";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  WeightStatsCard,
  WeightChart,
  WeightHistoryTable,
} from "@/components/weight";
import { UserDashboardSkeleton } from "@/components/ui";
import { useWeightData } from "@/hooks/useWeightData";
import { HiArrowLeft, HiUser, HiScale } from "react-icons/hi2";

/**
 * Pagina per visualizzare i dati peso di un cliente (vista trainer)
 * Pattern GRASP: Controller - coordina la visualizzazione dati peso cliente
 */
export default function TrainerClientWeightPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId;

  const [clientInfo, setClientInfo] = useState(null);
  const [loadingClient, setLoadingClient] = useState(true);

  // Weight data hook
  const {
    weightEntries,
    isLoading: weightLoading,
    error,
  } = useWeightData(userId);

  // Protezione della route
  useEffect(() => {
    if (status === "loading") return;
    if (
      status === "unauthenticated" ||
      session?.user?.entityType !== "user" ||
      session?.user?.role !== "TRAINER"
    ) {
      router.push("/login");
    }
  }, [session, status, router]);

  // Carica informazioni cliente
  useEffect(() => {
    const fetchClientInfo = async () => {
      if (!userId || !session?.user?.id) return;

      try {
        // Verifica che il trainer possa accedere a questo cliente
        const response = await fetch("/api/trainer/clients");

        if (!response.ok) {
          throw new Error("Impossibile caricare le informazioni del cliente");
        }

        const clients = await response.json();
        const client = clients.find((c) => c.userId === userId);

        if (!client) {
          throw new Error(
            "Cliente non trovato o non hai i permessi per visualizzarlo"
          );
        }

        setClientInfo(client);
      } catch (err) {
        console.error("Error fetching client info:", err);
      } finally {
        setLoadingClient(false);
      }
    };

    if (session?.user?.id) {
      fetchClientInfo();
    }
  }, [userId, session]);

  if (status === "loading" || loadingClient) {
    return <UserDashboardSkeleton />;
  }

  if (
    !session ||
    session.user.entityType !== "user" ||
    session.user.role !== "TRAINER"
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar userName={session.user.name || session.user.email} />

      <main className="p-4 mx-auto max-w-7xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => router.push("/trainer/dashboard")}
                className="mb-2"
              >
                <HiArrowLeft className="h-4 w-4 mr-2" />
                Torna ai clienti
              </Button>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <HiScale className="h-8 w-8 text-primary" />
                Tracciamento Peso Cliente
              </h1>
            </div>
          </div>

          {/* Client Info Card */}
          {clientInfo && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <HiUser className="h-5 w-5 text-primary" />
                  Informazioni Cliente
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="text-base font-medium text-foreground">
                      {clientInfo.firstName} {clientInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-base font-medium text-foreground">
                      {clientInfo.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Palestra</p>
                    <p className="text-base font-medium text-foreground">
                      {clientInfo.gymName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Abbonamento</p>
                    <p className="text-base font-medium text-foreground">
                      {clientInfo.subscriptionType}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card>
              <div className="p-6 text-center">
                <p className="text-destructive">{error}</p>
              </div>
            </Card>
          )}

          {/* Weight Data */}
          {!error && (
            <>
              {/* Stats Row */}
              <div className="grid gap-6 lg:grid-cols-3">
                <WeightStatsCard weightEntries={weightEntries} period="week" />
                <WeightStatsCard weightEntries={weightEntries} period="month" />
                <WeightStatsCard weightEntries={weightEntries} period="year" />
              </div>

              {/* Chart */}
              <WeightChart weightEntries={weightEntries} />

              {/* History Table */}
              <WeightHistoryTable weightEntries={weightEntries} limit={15} />
            </>
          )}

          {/* Empty State */}
          {!error && weightEntries.length === 0 && !weightLoading && (
            <Card>
              <div className="p-12 text-center">
                <HiScale className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nessun Dato Disponibile
                </h3>
                <p className="text-muted-foreground">
                  Questo cliente non ha ancora registrato misurazioni del peso.
                </p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
