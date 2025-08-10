'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/lib/firestore';
import { getUserTimezone, detectTimezoneFromLocation } from '@/lib/timezone';


const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let userCredential;
      if (mode === 'signup') {
        userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      }

      // First-time users get automatic timezone detection
      if (mode === 'signup' || userCredential) {
        try {
          const detectedTimezone = await detectTimezoneFromLocation();
          await updateUserProfile(userCredential.user.uid, {
            timezone: detectedTimezone,
            displayName: userCredential.user.displayName || '',
            email: userCredential.user.email || '',
          });
          
          toast({
            title: 'Welcome!',
            description: `Your timezone has been set to ${detectedTimezone}. You can change this in Settings.`,
          });
        } catch (timezoneError) {
          console.error('Error setting timezone:', timezoneError);
          // Location detection is optional during signup
        }
      }

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Authentication Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  async function handleGoogleSignIn() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Set timezone automatically for new users
      try {
        const detectedTimezone = await detectTimezoneFromLocation();
        await updateUserProfile(userCredential.user.uid, {
          timezone: detectedTimezone,
          displayName: userCredential.user.displayName || '',
          email: userCredential.user.email || '',
          photoURL: userCredential.user.photoURL || '',
        });
        
        toast({
          title: 'Welcome!',
          description: `Your timezone has been set to ${detectedTimezone}. You can change this in Settings.`,
        });
      } catch (timezoneError) {
        console.error('Error setting timezone:', timezoneError);
        // Location detection is optional during login
      }

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Google Sign-In Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
      >
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 62.3l-67.4 64.8C309.1 99.6 280.7 83 248 83c-84.3 0-152.3 68.3-152.3 153s68 153 152.3 153c92.8 0 135-64.2 142.8-98.7H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.8z"></path></svg>
        {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
      </Button>

      <div className="flex items-center space-x-2">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full !mt-6 bg-primary hover:bg-primary/90">
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <Link href={mode === 'login' ? '/signup' : '/login'} className="text-primary hover:underline">
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </Link>
      </p>
    </div>
  );
}
