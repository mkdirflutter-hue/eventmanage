import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  delta?: string
  deltaType?: 'positive' | 'negative' | 'neutral'
  icon?: LucideIcon
  color?: string
}

export default function StatCard({
  title,
  value,
  delta,
  deltaType = 'neutral',
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {delta && (
          <p
            className={cn(
              'text-sm font-medium',
              deltaType === 'positive' && 'text-emerald-500',
              deltaType === 'negative' && 'text-red-500',
              deltaType === 'neutral' && 'text-muted-foreground'
            )}
            style={color ? { color } : undefined}
          >
            {delta}
          </p>
        )}
      </div>
      {Icon && (
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color ? `${color}20` : 'hsl(var(--primary) / 0.1)' }}
        >
          <Icon className="w-6 h-6" style={{ color: color || 'hsl(var(--primary))' }} />
        </div>
      )}
    </div>
  )
}
