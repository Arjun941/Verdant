import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type KpiCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  description: string;
  onClick?: () => void;
  isInteractive?: boolean;
};

export default function KpiCard({ title, value, icon: Icon, description, onClick, isInteractive = false }: KpiCardProps) {
  return (
    <Card 
      onClick={onClick}
      className={cn(isInteractive && "cursor-pointer hover:bg-muted/80 transition-colors")}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
