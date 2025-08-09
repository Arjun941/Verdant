import AppSidebar from '@/components/dashboard/app-sidebar';
import Header from '@/components/dashboard/header';
import MobileBottomNav from '@/components/dashboard/mobile-bottom-nav';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 animate-in fade-in-0 zoom-in-95 duration-700 pb-20 sm:pb-4">
          {children}
        </main>
      </div>
       <MobileBottomNav />
    </div>
  );
}
