// app/dashboard/user/page.js
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Protezione della route
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || session?.user?.entityType !== "user") {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (session && session.user.entityType === "user") {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="flex items-center justify-between p-4 bg-white shadow-md">
          <h1 className="text-xl font-bold text-indigo-600">
            MyGym Member Area
          </h1>
          <div>
            <span className="mr-4 text-gray-800">
              Welcome, {session.user.name || session.user.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-4 py-2 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600"
            >
              Log Out
            </button>
          </div>
        </nav>

        <main className="p-4 mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900">Your Dashboard</h2>
          <div className="p-8 mt-6 bg-white rounded-lg shadow-md">
            <p>Welcome to your personal dashboard.</p>
            <p>
              In the future, you will see your workout plans, membership status,
              and more here.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
