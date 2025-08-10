'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/firestore';
import { getUserTimezone } from '@/lib/timezone';
import Link from 'next/link';

export function TimezoneNotification() {
  const [user] = useAuthState(auth);
  const [showNotification, setShowNotification] = useState(false);
  const [userTimezone, setUserTimezone] = useState<string>('');
  const [currentTimezone, setCurrentTimezone] = useState<string>('');

  useEffect(() => {
    if (user) {
      Promise.all([
        getUserProfile(user.uid),
        Promise.resolve(getUserTimezone())
      ]).then(([profile, detected]) => {
        const profileTimezone = profile?.timezone || 'UTC';
        setUserTimezone(profileTimezone);
        setCurrentTimezone(detected);
        
        // Show notification if timezones don't match
        if (profileTimezone !== detected && profileTimezone === 'UTC') {
          setShowNotification(true);
        }
      });
    }
  }, [user]);

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!showNotification || !user) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-lg text-orange-800">Timezone Setting</CardTitle>
        </div>
        <CardDescription className="text-orange-700">
          We've detected your timezone as <strong>{currentTimezone}</strong>, but your profile is set to <strong>{userTimezone}</strong>.
          Update your timezone in settings for accurate transaction timestamps.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Link href="/dashboard/settings">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              <Settings className="h-4 w-4 mr-2" />
              Update Timezone
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={handleDismiss}>
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
