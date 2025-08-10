'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, LineChart, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/transactions', icon: Package, label: 'Transactions' },
  { href: '/dashboard/analytics', icon: LineChart, label: 'Analytics' },
  { href: '/dashboard/ask', icon: Bot, label: 'Ask' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <motion.nav 
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/95 border-t z-50 backdrop-blur-md"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="grid h-full w-full grid-cols-4 relative">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.label}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 300 
              }}
              className="flex-1"
            >
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-2 hover:bg-muted-foreground/10 group h-full transition-all duration-300 w-full',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="flex flex-col items-center justify-center"
                >
                  <motion.div
                    animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="mb-1"
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>
                  <span className="text-xs font-medium leading-none">{item.label}</span>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
        {/* Active indicator positioned absolutely based on active item index */}
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          if (!isActive) return null;
          
          return (
            <motion.div
              key="activeIndicator"
              layoutId="activeTab"
              className="absolute top-0 w-6 h-1 bg-primary rounded-b-full"
              style={{
                left: `${(index * 25) + 12.5 - 3}%`, // Positions indicator at the center of each navigation item
              }}
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          );
        })}
      </div>
    </motion.nav>
  );
}
