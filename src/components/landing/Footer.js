export default function Footer() {
  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-muted-foreground">
          &copy; {new Date().getFullYear()} MyGym. Tutti i diritti riservati.
        </p>
      </div>
    </footer>
  );
}
