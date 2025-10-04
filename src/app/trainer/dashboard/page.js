"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserNavbar } from "@/components/user";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { UserDashboardSkeleton } from "@/components/ui";
import { useTrainerClients } from "@/hooks/useTrainerClients";
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
export default function TrainerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
    <div className="min-h-screen bg-background">
      <UserNavbar userName={session.user.name || session.user.email} />

      <main className="p-4 mx-auto max-w-7xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Trainer
          </h2>
          <p className="text-muted-foreground">
            Gestisci i tuoi clienti e monitora i loro progressi
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Card>
            <div className="p-6 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          </Card>
        )}

        {/* Statistiche Palestre */}
        {!error && (
          <>
            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Palestre
                      </p>
                      <p className="text-3xl font-bold text-primary">
                        {gyms.length}
                      </p>
                    </div>
                    <HiBuildingOffice2 className="h-12 w-12 text-primary/20" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Clienti Totali
                      </p>
                      <p className="text-3xl font-bold text-primary">
                        {clients.length}
                      </p>
                    </div>
                    <HiUsers className="h-12 w-12 text-primary/20" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Clienti Attivi
                      </p>
                      <p className="text-3xl font-bold text-success">
                        {clients.filter((c) => c.status === "ACTIVE").length}
                      </p>
                    </div>
                    <HiChartBar className="h-12 w-12 text-success/20" />
                  </div>
                </div>
              </Card>
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
                  <div className="relative flex-1">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Cerca cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedGym}
                    onChange={(e) => setSelectedGym(e.target.value)}
                    className="px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">Tutte le palestre</option>
                    {gyms.map((gym) => (
                      <option key={gym.id} value={gym.id}>
                        {gym.name}
                      </option>
                    ))}
                  </select>
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
                                router.push(`/trainer/clients/${client.userId}`)
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
      </main>
    </div>
  );
}
