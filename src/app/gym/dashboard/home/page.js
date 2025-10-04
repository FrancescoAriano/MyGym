"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MembershipChart } from "@/components/charts";
import {
  StatsCard,
  DashboardHeader,
  ExpiringMemberships,
  QuickActions,
} from "@/components/dashboard";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { useMembersData } from "@/hooks/useMembersData";
import { useSubscriptionsData } from "@/hooks/useSubscriptionsData";
import { ChartFactory } from "@/lib/ChartFactory";
import {
  HiUserPlus,
  HiCreditCard,
  HiUsers,
  HiExclamationCircle,
} from "react-icons/hi2";

export default function GymHomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    members,
    activeMembers,
    expiringMembers,
    isLoading: membersLoading,
  } = useMembersData();
  const { activeSubscriptions, isLoading: subscriptionsLoading } =
    useSubscriptionsData();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || session?.user?.entityType !== "gym") {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading" || membersLoading || subscriptionsLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  // Use ChartFactory to create chart data
  const membershipTrendChart = ChartFactory.createMembershipTrendChart(members);

  // Quick actions configuration
  const quickActions = [
    {
      label: "Aggiungi Nuovo Membro",
      icon: HiUserPlus,
      onClick: () => router.push("/gym/dashboard/utenti"),
      variant: "primary",
    },
    {
      label: "Gestisci Abbonamenti",
      icon: HiCreditCard,
      onClick: () => router.push("/gym/dashboard/abbonamenti"),
      variant: "secondary",
    },
  ];

  return (
    <DashboardLayout gymName={session?.user?.name || "MyGym"}>
      <div className="space-y-6">
        {/* Header */}
        <DashboardHeader
          title="Dashboard"
          subtitle="Panoramica della tua palestra"
        />

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Membri Attivi"
            value={activeMembers.length}
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
            value={activeSubscriptions.length}
            icon={HiCreditCard}
            color="success"
            onClick={() => router.push("/gym/dashboard/abbonamenti")}
          />
          <StatsCard
            title="In Scadenza"
            value={expiringMembers.length}
            icon={HiExclamationCircle}
            color="danger"
            onClick={() => router.push("/gym/dashboard/utenti")}
          />
        </div>

        {/* Charts */}
        <MembershipChart membershipTrend={membershipTrendChart.data} />

        {/* Quick Actions & Expiring Memberships */}
        <div className="grid gap-6 lg:grid-cols-2">
          <QuickActions actions={quickActions} />
          <ExpiringMemberships members={members} />
        </div>
      </div>
    </DashboardLayout>
  );
}
