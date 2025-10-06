import Link from "next/link";
import { HiArrowRight } from "react-icons/hi2";

export default function Hero() {
  return (
    <section className="min-h-svh flex items-center justify-center">
      <div className="max-w-7xl text-center px-4">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/15 mb-8">
          <span className="text-sm font-medium text-primary">
            La piattaforma All-in-One per la palestra
          </span>
        </div>

        <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-6">
          Benvenuto su MyGym
        </h1>

        <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
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
            Registra la tua palestra
          </Link>
        </div>
      </div>
    </section>
  );
}
