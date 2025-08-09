import { AuthForm } from '@/components/auth/auth-form';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Get started with Verdant today</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm mode="signup" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
