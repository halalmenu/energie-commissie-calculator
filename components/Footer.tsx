export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Energie Commissie Calculator</p>
          <p className="text-center md:text-right">
            Alle tarieven zijn gebaseerd op 3-jarige contracten
          </p>
        </div>
      </div>
    </footer>
  );
}

