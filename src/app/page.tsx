'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { LandingPage } from '@/components/landing-page';
import { Logo } from '@/components/logo';

export default function Home() {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (loading) return;
    if (user) {
      redirect('/dashboard');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Logo className="mb-8" />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return null;
}
