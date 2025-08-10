'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState, useTransition } from 'react';
import { getUserProfile } from '@/lib/firestore';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { handleUpdateProfile } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getCommonTimezones } from '@/lib/timezone';

const formSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50),
  photoDataUrl: z.string().optional().or(z.literal('')),
  balance: z.coerce.number().min(0, { message: 'Balance must be a positive number.' }),
  timezone: z.string().optional().or(z.literal('')),
});

export function SettingsForm() {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
      photoDataUrl: '',
      balance: 0,
      timezone: '',
    },
  });

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then((p) => {
        if (p) {
          setProfile(p);
          form.reset({ 
            displayName: p.displayName || '',
            photoDataUrl: '',
            balance: p.balance || 0,
            timezone: p.timezone || '',
          });
        }
      });
    }
  }, [user, form]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        form.setValue('photoDataUrl', dataUrl);
        setPreviewImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }

    console.log('Form values:', values);

    const formData = new FormData();
    formData.append('displayName', values.displayName);
    if (values.photoDataUrl) {
      formData.append('photoDataUrl', values.photoDataUrl);
    }
    formData.append('balance', values.balance.toString());
    if (values.timezone && values.timezone !== '') {
      formData.append('timezone', values.timezone);
    }
    formData.append('userId', user.uid);
    
    console.log('FormData entries:', Array.from(formData.entries()));
    
    startTransition(async () => {
      const result = await handleUpdateProfile(formData);
      if (result.success) {
        toast({ title: 'Success', description: result.message });
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    });
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-lg">
        <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={previewImage || profile?.photoURL || undefined} alt={profile?.displayName} />
              <AvatarFallback className="text-2xl">{getInitials(profile?.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <FormLabel>Profile Picture</FormLabel>
                <Input type="file" accept="image/*" onChange={handleFileChange} />
                <FormMessage />
            </div>
        </div>

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Balance (₹)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="50000" 
                  {...field}
                  value={field.value?.toString() || ''} 
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {getCommonTimezones().map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
