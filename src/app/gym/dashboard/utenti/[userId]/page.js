"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
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
 * Pagina per visualizzare i dati peso di un membro specifico
 * Pattern GRASP: Controller - coordina la visualizzazione dati peso membro
 */
export default function MemberWeightPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId;

  const [memberInfo, setMemberInfo] = useState(null);
  const [loadingMember, setLoadingMember] = useState(true);

  // Weight data hook
  const {
    weightEntries,
    isLoading: weightLoading,
    error,
  } = useWeightData(userId);

  // Protezione della route
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || session?.user?.entityType !== "gym") {
      router.push("/login");
    }
  }, [session, status, router]);

  // Carica informazioni membro
  useEffect(() => {
    const fetchMemberInfo = async () => {
      if (!userId || !session?.user?.id) return;

      try {
        const response = await fetch(
          `/api/gym/member/get?gymId=${session.user.id}&userId=${userId}`
        );

        if (!response.ok) {
          throw new Error("Impossibile caricare le informazioni del membro");
        }

        const data = await response.json();
        setMemberInfo(data);
      } catch (err) {
        console.error("Error fetching member info:", err);
      } finally {
        setLoadingMember(false);
      }
    };

    if (session?.user?.id) {
      fetchMemberInfo();
    }
  }, [userId, session]);

  if (status === "loading" || loadingMember) {
    return <UserDashboardSkeleton />;
  }

  if (!session || session.user.entityType !== "gym") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push("/gym/dashboard/utenti")}
              className="mb-2"
            >
              <HiArrowLeft className="h-4 w-4 mr-2" />
              Torna alla lista utenti
            </Button>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <HiScale className="h-8 w-8 text-primary" />
              Tracciamento Peso
            </h1>
          </div>
        </div>

        {/* Member Info Card */}
        {memberInfo && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <HiUser className="h-5 w-5 text-primary" />
                Informazioni Membro
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="text-base font-medium text-foreground">
                    {memberInfo.firstName} {memberInfo.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-base font-medium text-foreground">
                    {memberInfo.email}
                  </p>
                </div>
                {memberInfo.subscriptionType && (
                  <div>
                    <p className="text-sm text-muted-foreground">Abbonamento</p>
                    <p className="text-base font-medium text-foreground">
                      {memberInfo.subscriptionType.name}
                    </p>
                  </div>
                )}
                {memberInfo.role && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ruolo</p>
                    <p className="text-base font-medium text-foreground">
                      {memberInfo.role === "TRAINER" ? "Trainer" : "Cliente"}
                    </p>
                  </div>
                )}
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
                Questo membro non ha ancora registrato misurazioni del peso.
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
