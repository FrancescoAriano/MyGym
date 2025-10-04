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

export function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transition-transform duration-300 rounded-3xl lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
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
                  className={`flex gap-4 rounded-xl p-4 text-sm font-medium transition-all ${
                    item.disabled
                      ? "opacity-50 pointer-events-none"
                      : isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
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
              className="flex gap-4 rounded-xl p-4 text-sm font-medium transition-all text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary w-full"
            >
              {theme === "dark" ? (
                <HiSun className="w-5 h-5" />
              ) : (
                <HiMoon className="w-5 h-5" />
              )}
              {theme === "dark" ? "Modalità Chiara" : "Modalità Scura"}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex gap-4 rounded-xl p-4 text-sm font-medium transition-all text-destructive hover:bg-destructive/10 w-full"
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
        <header className="fixed top-0 right-0 z-30 p-8 lg:hidden">
          <div className="flex items-center justify-center bg-sidebar p-4 rounded-full hover:bg-muted transition-colors duration-300">
            <button onClick={() => setSidebarOpen((prev) => !prev)}>
              {sidebarOpen ? (
                <HiXMark className="h-6 w-6" />
              ) : (
                <HiBars3 className="h-6 w-6" />
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
