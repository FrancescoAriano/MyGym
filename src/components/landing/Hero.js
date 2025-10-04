import Link from "next/link";
import { HiArrowRight } from "react-icons/hi2";

export default function Hero() {
  return (
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
  );
}
