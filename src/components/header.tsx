import { ParkingCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import ThemeSwitcher from './theme-switcher';

export default function Header() {
  
  return (
    <header className="bg-card shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <ParkingCircle className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              مساعد الركن
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button asChild variant="ghost">
              <Link href="/admin">
                <Shield className="ml-2 h-4 w-4" />
                المسؤول
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
