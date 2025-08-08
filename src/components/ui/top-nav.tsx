"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wine, Bot, LayoutDashboard, Lightbulb, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const links = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/vineyards", label: "Gestión de Viñedo", icon: Wine },
  { href: "/recommendations", label: "Sugerencias IA", icon: Lightbulb },
  { href: "/fermentia", label: "FermentIA (Chat)", icon: Bot },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <Wine className="h-6 w-6 text-primary" />
            <span>FermentIA</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  pathname === href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." className="pl-8 w-[220px] md:w-[280px]" />
          </div>

          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
