import { Calculator } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Energie Commissie Tool</h1>
            <p className="text-sm text-muted-foreground">Bereken en vergelijk commissies</p>
          </div>
        </div>
      </div>
    </header>
  );
}

