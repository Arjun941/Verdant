import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card 
        onClick={onClick}
        className={cn(
          "transition-all duration-300 hover:shadow-lg border-border/50 hover:border-border",
          isInteractive && "cursor-pointer hover:bg-muted/50"
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <motion.div
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="text-2xl font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {value}
          </motion.div>
          <motion.p 
            className="text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {description}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
