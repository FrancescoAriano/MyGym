export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="group bg-card rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
