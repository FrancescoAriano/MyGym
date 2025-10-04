import {
  HiUsers,
  HiChartBar,
  HiCreditCard,
  HiDevicePhoneMobile,
  HiShieldCheck,
  HiSparkles,
} from "react-icons/hi2";
import FeatureCard from "./FeatureCard";

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

export default function Features() {
  return (
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
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
