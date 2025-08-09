'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Home, LineChart, LogOut, Package, Settings, Lightbulb, Bot } from 'lucide-react';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/lib/firestore';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/transactions', icon: Package, label: 'Transactions' },
  { href: '/dashboard/analytics', icon: LineChart, label: 'Analytics' },
  { href: '/dashboard/insights', icon: Lightbulb, label: 'Insights' },
  { href: '/dashboard/ask', icon: Bot, label: 'Ask Verdant' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setProfile);
    } else {
      setProfile(null);
    }
  }, [user]);

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <motion.aside 
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex"
    >
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Link 
            href="/dashboard" 
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base transition-transform hover:scale-110"
          >
            <Image src="/icon.png" alt="Verdant Logo" width={36} height={36} className="h-9 w-9 rounded-full" />
            <span className="sr-only">Verdant</span>
          </Link>
        </motion.div>
        <TooltipProvider>
          {navItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.3 + (index * 0.1),
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 hover:text-foreground hover:scale-110 hover:shadow-md md:h-8 md:w-8 active:scale-95',
                      pathname === item.href && 'bg-accent text-accent-foreground shadow-sm scale-105',
                    )}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <item.icon className="h-5 w-5" />
                    </motion.div>
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            </motion.div>
          ))}
        </TooltipProvider>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <DropdownMenu>
              <TooltipProvider>
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="overflow-hidden rounded-full h-9 w-9 transition-all duration-300 hover:scale-110 hover:shadow-md active:scale-95">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={profile?.photoURL || undefined} alt={profile?.displayName || ''} />
                                <AvatarFallback>{getInitials(profile?.displayName)}</AvatarFallback>
                              </Avatar>
                               <span className="sr-only">User Menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="right">Profile</TooltipContent>
                  </Tooltip>
              </TooltipProvider>
               <DropdownMenuContent side="right" align="end">
                <DropdownMenuLabel>{profile?.displayName || 'My Account'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/login">Logout</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <TooltipProvider>
             <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/settings"
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 hover:text-foreground hover:scale-110 hover:shadow-md md:h-8 md:w-8 active:scale-95',
                      pathname === '/dashboard/settings' && 'bg-accent text-accent-foreground shadow-sm scale-105',
                    )}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Settings className="h-5 w-5" />
                    </motion.div>
                    <span className="sr-only">Settings</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
          </TooltipProvider>
        </motion.div>
      </nav>
    </motion.aside>
  );
}
