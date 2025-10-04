"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  HiUsers,
  HiChartBar,
  HiCreditCard,
  HiDevicePhoneMobile,
  HiShieldCheck,
  HiSparkles,
  HiMoon,
  HiSun,
  HiArrowRight,
} from "react-icons/hi2";

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: HiUsers,
      title: "Gestione Membri",
      description:
        "Gestisci i tuoi membri, abbonamenti e scadenze in modo semplice ed efficace.",
    },
    {
      icon: HiChartBar,
      title: "Analytics Avanzate",
      description:
        "Monitora l'andamento della tua palestra con grafici e statistiche in tempo reale.",
    },
    {
      icon: HiCreditCard,
      title: "Pagamenti Facili",
      description:
        "Traccia abbonamenti, scadenze e gestisci i pagamenti senza problemi.",
    },
    {
      icon: HiDevicePhoneMobile,
      title: "Mobile Responsive",
      description:
        "Accedi alla piattaforma da qualsiasi dispositivo, ovunque tu sia.",
    },
    {
      icon: HiShieldCheck,
      title: "Sicuro & Affidabile",
      description:
        "I tuoi dati sono protetti con i più alti standard di sicurezza.",
    },
    {
      icon: HiSparkles,
      title: "Interfaccia Moderna",
      description:
        "Design pulito e intuitivo per un'esperienza utente eccezionale.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  M
                </span>
              </div>
              <span className="text-xl font-bold text-foreground">MyGym</span>
            </div>
            <div className="flex items-center gap-4">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 "
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <HiSun className="w-5 h-5" />
                  ) : (
                    <HiMoon className="w-5 h-5" />
                  )}
                </button>
              )}
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-foreground border border-primary rounded-lg hover:text-primary-foreground hover:bg-primary transition-color"
              >
                Accedi
              </Link>
              <Link
                href="/gym/register-gym"
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground border border-primary rounded-lg hover:text-foreground hover:bg-primary-foreground transition-all hidden sm:inline-flex"
              >
                Registra Palestra
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-dvh flex items-center">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 border border-primary/15 mb-8">
            <span className="text-sm font-medium text-primary">
              La Piattaforma All-in-One per la Tua Palestra
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            Benvenuto su MyGym
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Gestisci la tua palestra in modo smart. Membri, abbonamenti,
            statistiche: tutto in un unico posto.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Accedi
              <HiArrowRight className="h-5 w-5 ml-1 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              href="/gym/register-gym"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-card text-foreground rounded-xl hover:bg-muted transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Registrati la tua palestra
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/75">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Tutto ciò di cui hai bisogno
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              MyGym offre tutti gli strumenti necessari per gestire la tua
              palestra in modo efficiente e professionale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-card rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl p-12 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Pronto a iniziare?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Unisciti a centinaia di palestre che stanno già utilizzando MyGym
              per gestire il loro business.
            </p>
            <Link
              href="/gym/register-gym"
              className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Registra la Tua Palestra
              <HiArrowRight className="h-5 w-5 ml-1 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} MyGym. Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </div>
  );
}
