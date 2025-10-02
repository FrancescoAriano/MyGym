"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import {
  HiHome,
  HiUserGroup,
  HiCreditCard,
  HiDocumentText,
  HiChatBubbleLeftRight,
  HiBeaker,
  HiMoon,
  HiSun,
  HiArrowRightOnRectangle,
  HiBars3,
  HiXMark,
} from "react-icons/hi2";

const navigation = [
  { name: "Home", href: "/gym/dashboard/home", icon: HiHome },
  { name: "Utenti", href: "/gym/dashboard/utenti", icon: HiUserGroup },
  {
    name: "Abbonamenti",
    href: "/gym/dashboard/abbonamenti",
    icon: HiCreditCard,
  },
  {
    name: "Schede",
    href: "/gym/dashboard/schede",
    icon: HiDocumentText,
    disabled: true,
  },
  {
    name: "Diete",
    href: "/gym/dashboard/diete",
    icon: HiBeaker,
    disabled: true,
  },
  {
    name: "Commenti",
    href: "/gym/dashboard/commenti",
    icon: HiChatBubbleLeftRight,
    disabled: true,
  },
];

export function DashboardLayout({ children, gymName = "" }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar transition-transform duration-300 ease-in-out rounded-r-2xl lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col pt-4 lg:pt-5">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-2xl font-bold text-sidebar-foreground z-50">
              {gymName}
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.disabled ? "#" : item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 rounded-lg px-2 py-4 text-sm font-medium transition-colors ${
                    item.disabled
                      ? "cursor-not-allowed opacity-50"
                      : isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {item.name}
                  {item.disabled && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      Presto
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4 space-y-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex w-full items-center gap-4 rounded-lg px-4 py-4 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              {theme === "dark" ? (
                <HiSun className="h-5 w-5" />
              ) : (
                <HiMoon className="h-5 w-5" />
              )}
              {theme === "dark" ? "Modalità Chiara" : "Modalità Scura"}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-4 rounded-lg px-4 py-4 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <HiArrowRightOnRectangle className="h-5 w-5" />
              Esci
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="fixed top-0 right-0 p-4 z-30 lg:hidden">
          <div className="flex items-center justify-between p-4 bg-sidebar rounded-full shadow-lg">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="text-foreground"
            >
              <div
                className={`transition-transform duration-300 ${
                  sidebarOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                {sidebarOpen ? (
                  <HiXMark className="h-7 w-7" />
                ) : (
                  <HiBars3 className="h-7 w-7" />
                )}
              </div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
