import { ParkingCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

export default function Header() {
  
  return (
    <header className="bg-card shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <ParkingCircle className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              ParkPilot
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/admin">
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
