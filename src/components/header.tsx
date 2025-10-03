import { ParkingCircle, Shield, MoreVertical, Car } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import ThemeSwitcher from './theme-switcher';
import FindCarDialog from './find-car-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

export default function Header() {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ParkingCircle className="h-8 w-8 text-primary" />
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              ParkPilot
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            <FindCarDialog />
            <Button asChild variant="ghost">
              <Link href="/admin">
                <Shield className="ml-2 h-4 w-4" />
                المسؤول
              </Link>
            </Button>
            <ThemeSwitcher />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">فتح القائمة</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <FindCarDialog />
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="w-full justify-start cursor-pointer">
                    <Shield className="ml-2 h-4 w-4" />
                    <span>المسؤول</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <ThemeSwitcher />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
