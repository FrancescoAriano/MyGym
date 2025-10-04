import Link from "next/link";
import { HiArrowRight } from "react-icons/hi2";

export default function CTA() {
  return (
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
  );
}
