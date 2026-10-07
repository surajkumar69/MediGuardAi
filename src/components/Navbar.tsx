import Link from "next/link";
import { ShieldPlus } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <ShieldPlus className="h-7 w-7 text-primary" />
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-none">
              MediGuard AI
            </span>
            {process.env.NODE_ENV === 'development' && (
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-0.5">Demo Mode — Sample Data</span>
            )}
          </div>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/checker" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Prescription Checker
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Doctor Dashboard
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="hidden sm:inline-flex rounded-full px-6">
            Log In
          </Button>
          <Button className="rounded-full px-6 shadow-lg shadow-primary/20">
            <Link href="/checker">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
