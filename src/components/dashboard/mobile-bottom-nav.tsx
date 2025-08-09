'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, LineChart, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/transactions', icon: Package, label: 'Transactions' },
  { href: '/dashboard/analytics', icon: LineChart, label: 'Analytics' },
  { href: '/dashboard/ask', icon: Bot, label: 'Ask' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'inline-flex flex-col items-center justify-center px-5 hover:bg-muted-foreground/10 group',
              pathname.startsWith(item.href) && item.href !== '/' ? 'text-primary' : pathname === '/' && item.href === '/' ? 'text-primary' : 'text-muted-foreground',
               pathname === item.href ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
