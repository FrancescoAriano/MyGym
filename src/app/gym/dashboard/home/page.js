"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MembershipChart } from "@/components/MembershipChart";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  HiUserPlus,
  HiCreditCard,
  HiUsers,
  HiExclamationCircle,
} from "react-icons/hi2";

export default function GymHomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || session?.user?.entityType !== "gym") {
      router.push("/login");
      return;
    }
    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [membersRes, subsRes] = await Promise.all([
        fetch("/api/gym/member/get"),
        fetch("/api/gym/subscription-type/protected/get"),
      ]);
      if (membersRes.ok) setMembers(await membersRes.json());
      if (subsRes.ok) setSubscriptions(await subsRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Caricamento...</div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate stats
  const activeMembers = members.filter((m) => m.status === "ACTIVE").length;
  const expiringMembers = members.filter((m) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(m.endDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  }).length;

  // Mock data for charts
  // Dati reali per il grafico Andamento Iscritti
  const monthNames = [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Set",
    "Ott",
    "Nov",
    "Dic",
  ];
  // Raggruppa membri per mese di iscrizione
  const membersByMonth = members.reduce((acc, m) => {
    if (!m.startDate) return acc;
    const date = new Date(m.startDate);
    const month = date.getMonth();
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  // Crea array per il grafico
  const membershipTrend = monthNames.map((name, idx) => ({
    month: name,
    members: membersByMonth[idx] || 0,
  }));

  return (
    <DashboardLayout gymName={session?.user?.name || "MyGym"}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Panoramica della tua palestra
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Membri Attivi"
            value={activeMembers}
            icon={HiUsers}
            color="primary"
            onClick={() => router.push("/gym/dashboard/utenti")}
          />
          <StatsCard
            title="Totale Membri"
            value={members.length}
            icon={HiUserPlus}
            color="info"
            onClick={() => router.push("/gym/dashboard/utenti")}
          />
          <StatsCard
            title="Tipi Abbonamento"
            value={subscriptions.filter((s) => s.isActive).length}
            icon={HiCreditCard}
            color="success"
            onClick={() => router.push("/gym/dashboard/abbonamenti")}
          />
          <StatsCard
            title="In Scadenza"
            value={expiringMembers}
            icon={HiExclamationCircle}
            color="danger"
            onClick={() => router.push("/gym/dashboard/utenti")}
          />
        </div>

        {/* Charts */}
        <MembershipChart membershipTrend={membershipTrend} />

        {/* Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Azioni Rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => router.push("/gym/dashboard/utenti")}
                icon={HiUserPlus}
                className="w-full py-4"
              >
                Aggiungi Nuovo Membro
              </Button>
              <Button
                onClick={() => router.push("/gym/dashboard/abbonamenti")}
                variant="secondary"
                icon={HiCreditCard}
                className="w-full py-4"
              >
                Gestisci Abbonamenti
              </Button>
            </CardContent>
          </Card>

          {/* Expiring Memberships */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HiExclamationCircle className="h-5 w-5 text-destructive" />
                Abbonamenti in Scadenza
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[200px] overflow-y-auto">
                {members
                  .filter((m) => {
                    const daysUntilExpiry = Math.ceil(
                      (new Date(m.endDate) - new Date()) / (1000 * 60 * 60 * 24)
                    );
                    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
                  })
                  .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
                  .slice(0, 5)
                  .map((member) => {
                    const daysLeft = Math.ceil(
                      (new Date(member.endDate) - new Date()) /
                        (1000 * 60 * 60 * 24)
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
                {expiringMembers === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4 my-auto">
                    Nessun abbonamento in scadenza
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
