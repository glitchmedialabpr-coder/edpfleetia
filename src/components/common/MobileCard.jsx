import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Mobile-optimized card component for displaying table data on small screens
 */
export default function MobileCard({ children, className, ...props }) {
  return (
    <Card className={cn("p-4 border-0 shadow-sm hover:shadow-md transition-shadow", className)} {...props}>
      {children}
    </Card>
  );
}

export function MobileCardRow({ label, value, icon: Icon, className }) {
  return (
    <div className={cn("flex items-center justify-between py-2", className)}>
      <div className="flex items-center gap-2 text-sm text-slate-500 select-none">
        {Icon && <Icon className="w-4 h-4" />}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-slate-800 text-right">{value}</div>
    </div>
  );
}

export function MobileCardSection({ title, children, className }) {
  return (
    <div className={cn("space-y-1", className)}>
      {title && <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 select-none">{title}</h4>}
      {children}
    </div>
  );
}