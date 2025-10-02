"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  HiUserPlus,
  HiCreditCard,
  HiUsers,
  HiChartBar,
  HiExclamationCircle,
} from "react-icons/hi2";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

  function getCssVar(name) {
    if (typeof window === "undefined") return "#8884d8";
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim() || "#8884d8"
    );
  }

  const borderColor = getCssVar("--border");
  const cardColor = getCssVar("--card");
  const foreground = getCssVar("--foreground");
  const mutedForeground = getCssVar("--muted-foreground");

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

  const subscriptionDistribution = subscriptions
    .filter((s) => s.isActive)
    .map((sub) => ({
      name: sub.name,
      count: members.filter((m) => m.subscriptionTypeId === sub.id).length,
    }));

  return (
    <DashboardLayout gymName={session?.user?.name || "MyGym"}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Panoramica della tua palestra
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div
            // mouse pointer
            className="bg-card rounded-xl border border-border p-6 shadow-lg hover:scale-105 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => router.push("/gym/dashboard/utenti")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Membri Attivi
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {activeMembers}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <HiUsers className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div
            className="bg-card rounded-xl border border-border p-6 shadow-lg hover:scale-105 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => router.push("/gym/dashboard/utenti")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Totale Membri
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {members.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-chart-2/20 flex items-center justify-center">
                <HiUserPlus className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </div>

          <div
            className="bg-card rounded-xl border border-border p-6 shadow-lg hover:scale-105 hover:shadow-xl transition-all cursor-pointer"
            cursor-pointer
            onClick={() => router.push("/gym/dashboard/abbonamenti")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tipi Abbonamento
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {subscriptions.filter((s) => s.isActive).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-chart-3/20 flex items-center justify-center">
                <HiCreditCard className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </div>

          <div
            className="bg-card rounded-xl border border-border p-6 shadow-lg hover:scale-105 hover:shadow-xl transition-all cursor-pointer"
            cursor-pointer
            onClick={() => router.push("/gym/dashboard/utenti")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  In Scadenza
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {expiringMembers}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <HiExclamationCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Membership Trend */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <HiChartBar className="h-5 w-5 text-primary" />
              Andamento Iscritti
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={membershipTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                <XAxis
                  dataKey="month"
                  stroke={foreground}
                  tick={{ fill: foreground, fontSize: 14 }}
                  padding={{ left: 16, right: 16 }}
                  angle={-45}
                  textAnchor="end"
                />
                <Line
                  type="monotone"
                  dataKey="members"
                  stroke={mutedForeground}
                  strokeWidth={2}
                  name="Membri"
                  dot={{
                    stroke: foreground,
                    fill: foreground,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Subscription Distribution */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <HiCreditCard className="h-5 w-5 text-primary" />
              Distribuzione Abbonamenti
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subscriptionDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                <XAxis
                  dataKey="name"
                  stroke={mutedForeground}
                  tick={{ fill: foreground, fontSize: 14 }}
                  angle={-45}
                  textAnchor="end"
                />
                <Bar
                  dataKey="count"
                  fill={foreground}
                  radius={[8, 8, 0, 0]}
                  name="Membri"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Azioni Rapide
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/gym/dashboard/utenti")}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <HiUserPlus className="h-5 w-5" />
                <span className="font-medium">Aggiungi Nuovo Membro</span>
              </button>
              <button
                onClick={() => router.push("/gym/dashboard/abbonamenti")}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <HiCreditCard className="h-5 w-5" />
                <span className="font-medium">Gestisci Abbonamenti</span>
              </button>
            </div>
          </div>

          {/* Expiring Memberships */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <HiExclamationCircle className="h-5 w-5 text-destructive" />
              Abbonamenti in Scadenza
            </h3>
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
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
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nessun abbonamento in scadenza
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
