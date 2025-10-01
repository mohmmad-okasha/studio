import { ParkingCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <ParkingCircle className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            ParkPilot
          </h1>
        </div>
      </div>
    </header>
  );
}
