import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className, iconOnly = false }: { className?: string, iconOnly?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 text-primary', className)}>
      <Image src="/icon.png" alt="Verdant Logo" width={36} height={36} className="h-9 w-9 rounded-full" />
      <span className={cn(
        "text-xl font-bold text-foreground",
        iconOnly && 'sr-only'
      )}>Verdant</span>
    </div>
  );
}
