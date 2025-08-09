'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export default function Home() {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (loading) return;
    if (user) {
      redirect('/dashboard');
    } else {
      redirect('/login');
    }
  }, [user, loading]);

  return null;
}
