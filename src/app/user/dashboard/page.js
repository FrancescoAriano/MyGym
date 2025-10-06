// app/user/dashboard/page.js
"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { UserDashboardSkeleton } from "@/components/ui";
import { MembershipStatusCard, WorkoutPlanCard } from "@/components/user";
import { DashboardHeader, StatsCard } from "@/components/dashboard";
import { useTrainerClients } from "@/hooks/useTrainerClients";
import {
  WeightEntryForm,
  WeightStatsCard,
  WeightChart,
  WeightHistoryTable,
} from "@/components/weight";
import { useWeightData } from "@/hooks/useWeightData";
import { useMembershipData } from "@/hooks/useMembershipData";
import {
  HiChartBar,
  HiScale,
  HiUsers,
  HiMagnifyingGlass,
  HiBuildingOffice2,
} from "react-icons/hi2";

export default function UserDashboardPageWrapper(props) {
  return (
    <Suspense>
      <UserDashboardPage {...props} />
    </Suspense>
  );
}

function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGym, setSelectedGym] = useState("all");

  const isTrainer = session?.user?.role === "TRAINER";

  // Weight data hook
  const {
    weightEntries,
    isLoading: weightLoading,
    refetch: refetchWeight,
  } = useWeightData(session?.user?.id);

  // Membership data hook (solo per clienti, non per trainer)
  const {
    membership: realMembership,
    isLoading: membershipLoading,
    error: membershipError,
  } = useMembershipData();

  // Trainer data hooks (solo se trainer)
  const {
    clients = [],
    gyms = [],
    isLoading: trainerLoading,
    error: trainerError,
    getClientsCountByGym,
  } = useTrainerClients(isTrainer);

  // Protezione della route
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || session?.user?.entityType !== "user") {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <UserDashboardSkeleton />;
  }

  if (session && session.user.entityType === "user") {
    // Usa i dati reali se disponibili, altrimenti mock
    const membership = realMembership || {
      type: "Nessun Abbonamento",
      status: "inactive",
      startDate: null,
      endDate: null,
      price: "0",
    };

    // Filtra clienti per trainer
    const filteredClients = isTrainer
      ? clients.filter((client) => {
          const matchesSearch =
            client.firstName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            client.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email?.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesGym =
            selectedGym === "all" || client.gymId === selectedGym;

          return matchesSearch && matchesGym;
        })
      : [];

    const gymsWithCount =
      isTrainer && getClientsCountByGym ? getClientsCountByGym() : [];

    return (
      <DashboardLayout
        userName={session.user.name || session.user.email}
        userEmail={session.user.email}
        userType={isTrainer ? "trainer" : "user"}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {activeTab === "overview"
                ? isTrainer
                  ? "Dashboard Trainer"
                  : "La tua Dashboard"
                : "Tracciamento Peso"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {activeTab === "overview"
                ? isTrainer
                  ? "Gestisci i tuoi clienti e monitora i loro progressi"
                  : "Monitora i tuoi progressi e gestisci i tuoi dati"
                : "Registra e monitora il tuo peso nel tempo"}
            </p>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Sezione CLIENT: Abbonamento e Workout */}
              {!isTrainer && (
                <>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <MembershipStatusCard
                      membership={membership}
                      userName={session.user.name || session.user.email}
                    />
                    <WorkoutPlanCard />
                  </div>

                  {/* Riepilogo Peso */}
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      Riepilogo Peso
                    </h2>
                    <WeightStatsCard
                      weightEntries={weightEntries}
                      initialPeriod="month"
                    />
                  </div>
                </>
              )}

              {/* Sezione TRAINER: Statistiche, Palestre, Clienti */}
              {isTrainer && (
                <>
                  {trainerError && (
                    <Card>
                      <div className="p-6 text-center">
                        <p className="text-destructive">{trainerError}</p>
                      </div>
                    </Card>
                  )}

                  {!trainerError && (
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
                          value={
                            clients.filter((c) => c.status === "ACTIVE").length
                          }
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
                            <HiUsers className="h-5 w-5 text-primary" />I tuoi
                            Clienti
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
            </div>
          )}

          {/* Weight Tracking Tab */}
          {activeTab === "weight" && (
            <div className="space-y-6">
              {/* Form and Stats Row */}
              <div className="grid gap-6 lg:grid-cols-2">
                <WeightEntryForm onSuccess={refetchWeight} />
                <WeightStatsCard
                  weightEntries={weightEntries}
                  initialPeriod="month"
                />
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

  return null;
}
