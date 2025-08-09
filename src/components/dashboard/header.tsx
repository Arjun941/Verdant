'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Home, LineChart, LogOut, Menu, Package, Search, Settings, Lightbulb, Bot } from 'lucide-react';
import { Input } from '../ui/input';
import { Logo } from '../logo';
import { cn } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { use, useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/types';
import { getUserProfile } from '@/lib/firestore';
import Image from 'next/image';
import { motion } from 'framer-motion';


const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/transactions', icon: Package, label: 'Transactions' },
  { href: '/dashboard/analytics', icon: LineChart, label: 'Analytics' },
  { href: '/dashboard/insights', icon: Lightbulb, label: 'Insights' },
  { href: '/dashboard/ask', icon: Bot, label: 'Ask Verdant' },
  { href: 'dashboard/settings', icon: Settings, label: 'Settings'},
];

export default function Header() {
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
    <motion.header 
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-md px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
    >
       <motion.div
         initial={{ scale: 0, rotate: -180 }}
         animate={{ scale: 1, rotate: 0 }}
         transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }}
       >
         <Link href="/dashboard" className="sm:hidden flex items-center gap-2 text-primary transition-transform hover:scale-105">
              <Image src="/icon.png" alt="Verdant Logo" width={36} height={36} className="h-9 w-9 rounded-full" />
              <span className="sr-only">Verdant</span>
        </Link>
       </motion.div>
      <div className="relative flex-1" />
       <motion.div 
         className="sm:hidden"
         initial={{ scale: 0, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ duration: 0.5, delay: 0.4 }}
       >
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="overflow-hidden rounded-full h-9 w-9 transition-all duration-300 hover:scale-110 hover:shadow-md active:scale-95">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.photoURL || undefined} alt={profile?.displayName || ''} />
                  <AvatarFallback>{getInitials(profile?.displayName)}</AvatarFallback>
                </Avatar>
                  <span className="sr-only">User Menu</span>
              </Button>
            </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
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
    </motion.header>
  );
}
