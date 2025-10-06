"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { UserDashboardSkeleton } from "@/components/ui";
import { DashboardHeader, StatsCard } from "@/components/dashboard";
import { useTrainerClients } from "@/hooks/useTrainerClients";
import { useWeightData } from "@/hooks/useWeightData";
import {
  WeightEntryForm,
  WeightStatsCard,
  WeightChart,
  WeightHistoryTable,
} from "@/components/weight";
import {
  HiUsers,
  HiScale,
  HiMagnifyingGlass,
  HiBuildingOffice2,
  HiChartBar,
} from "react-icons/hi2";

/**
 * Dashboard per i trainer
 * Pattern GRASP: Controller - coordina la visualizzazione clienti e palestre
 */

export default function TrainerDashboardPageWrapper(props) {
  return (
    <Suspense>
      <TrainerDashboardPage {...props} />
    </Suspense>
  );
}

function TrainerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGym, setSelectedGym] = useState("all");

  const {
    clients,
    gyms,
    isLoading,
    error,
    getClientsByGym,
    getClientsCountByGym,
  } = useTrainerClients();

  // Weight data hook per il trainer stesso
  const {
    weightEntries,
    isLoading: weightLoading,
    refetch: refetchWeight,
  } = useWeightData(session?.user?.id);

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

  if (status === "loading" || isLoading) {
    return <UserDashboardSkeleton />;
  }

  if (
    !session ||
    session.user.entityType !== "user" ||
    session.user.role !== "TRAINER"
  ) {
    return null;
  }

  // Filtra clienti in base alla ricerca e palestra selezionata
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGym = selectedGym === "all" || client.gymId === selectedGym;

    return matchesSearch && matchesGym;
  });

  const gymsWithCount = getClientsCountByGym();

  return (
    <DashboardLayout
      userName={session.user.name || session.user.email}
      userEmail={session.user.email}
      userType="trainer"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {activeTab === "overview"
              ? "Dashboard Trainer"
              : "Tracciamento Peso"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {activeTab === "overview"
              ? "Gestisci i tuoi clienti e monitora i loro progressi"
              : "Registra e monitora il tuo peso nel tempo"}
          </p>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Error State */}
            {error && (
              <Card>
                <div className="p-6 text-center">
                  <p className="text-destructive">{error}</p>
                </div>
              </Card>
            )}

            {/* Statistiche */}
            {!error && (
              <>
                <div className="grid gap-6 md:grid-cols-3">
                  <StatsCard
                    title="Palestre"
                    value={gyms.length}
                    icon={HiBuildingOffice2}
                    trend="neutral"
                  />
                  <StatsCard
                    title="Clienti Totali"
                    value={clients.length}
                    icon={HiUsers}
                    trend="neutral"
                  />
                  <StatsCard
                    title="Clienti Attivi"
                    value={clients.filter((c) => c.status === "ACTIVE").length}
                    icon={HiChartBar}
                    trend="positive"
                    trendValue="+0%"
                  />
                </div>

                {/* Palestre */}
                <Card className="mb-6">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <HiBuildingOffice2 className="h-5 w-5 text-primary" />
                      Le tue Palestre
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {gymsWithCount.map((gym) => (
                        <div
                          key={gym.id}
                          className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <h4 className="font-semibold text-foreground mb-2">
                            {gym.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {gym.address}
                          </p>
                          <Badge variant="default">
                            {gym.clientsCount} client
                            {gym.clientsCount !== 1 ? "i" : "e"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Lista Clienti */}
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <HiUsers className="h-5 w-5 text-primary" />I tuoi Clienti
                    </h3>

                    {/* Filtri */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <Input
                        type="text"
                        placeholder="Cerca cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={HiMagnifyingGlass}
                        className="flex-1"
                      />
                      <Select
                        value={selectedGym}
                        onChange={(value) => setSelectedGym(value)}
                        options={[
                          { value: "all", label: "Tutte le palestre" },
                          ...gyms.map((gym) => ({
                            value: gym.id,
                            label: gym.name,
                          })),
                        ]}
                        className="sm:w-64"
                      />
                    </div>

                    {/* Tabella Clienti */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                              Nome
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                              Palestra
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                              Stato
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                              Azioni
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredClients.map((client) => (
                            <tr
                              key={client.id}
                              className="hover:bg-muted/50 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div className="font-medium text-foreground">
                                  {client.firstName} {client.lastName}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {client.email}
                              </td>
                              <td className="px-4 py-3 text-foreground">
                                {client.gymName}
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  variant={
                                    client.status === "ACTIVE"
                                      ? "success"
                                      : "default"
                                  }
                                >
                                  {client.status === "ACTIVE"
                                    ? "Attivo"
                                    : "Inattivo"}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    router.push(
                                      `/trainer/clients/${client.userId}`
                                    )
                                  }
                                >
                                  <HiScale className="h-4 w-4 mr-2" />
                                  Peso
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {filteredClients.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        Nessun cliente trovato
                      </div>
                    )}
                  </div>
                </Card>
              </>
            )}
          </>
        )}

        {/* Weight Tracking Tab */}
        {activeTab === "weight" && (
          <div className="space-y-6">
            {/* Form and Stats Row */}
            <div className="grid gap-6 lg:grid-cols-3">
              <WeightEntryForm onSuccess={refetchWeight} />
              <WeightStatsCard weightEntries={weightEntries} period="week" />
              <WeightStatsCard weightEntries={weightEntries} period="month" />
            </div>

            {/* Chart */}
            <WeightChart weightEntries={weightEntries} />

            {/* History Table */}
            <WeightHistoryTable weightEntries={weightEntries} limit={10} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
