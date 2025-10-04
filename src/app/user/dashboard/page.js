// app/user/dashboard/page.js
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  UserNavbar,
  MembershipStatusCard,
  WorkoutPlanCard,
} from "@/components/user";
import {
  WeightEntryForm,
  WeightStatsCard,
  WeightChart,
  WeightHistoryTable,
} from "@/components/weight";
import { UserDashboardSkeleton } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useWeightData } from "@/hooks/useWeightData";
import { HiChartBar, HiScale } from "react-icons/hi2";

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Weight data hook
  const {
    weightEntries,
    isLoading: weightLoading,
    refetch: refetchWeight,
  } = useWeightData(session?.user?.id);

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
    // Mock data per l'abbonamento - in futuro verrà da un'API
    const mockMembership = {
      type: "Abbonamento Mensile",
      status: "active",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      price: "49.99",
    };

    return (
      <div className="min-h-screen bg-background">
        <UserNavbar userName={session.user.name || session.user.email} />

        <main className="p-4 mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            La tua Dashboard
          </h2>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b border-border">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              onClick={() => setActiveTab("overview")}
              className="rounded-b-none"
            >
              <HiChartBar className="h-4 w-4 mr-2" />
              Panoramica
            </Button>
            <Button
              variant={activeTab === "weight" ? "default" : "ghost"}
              onClick={() => setActiveTab("weight")}
              className="rounded-b-none"
            >
              <HiScale className="h-4 w-4 mr-2" />
              Tracciamento Peso
            </Button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                <MembershipStatusCard membership={mockMembership} />
                <WorkoutPlanCard />
              </div>
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
        </main>
      </div>
    );
  }

  return null;
}
