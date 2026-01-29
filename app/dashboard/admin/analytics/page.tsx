'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import StatCard from '@/components/common/StatCard'
import SmallChart from '@/components/common/SmallChart'
import { Users, Calendar, Building2, TrendingUp, Eye, Clock } from 'lucide-react'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const stats = [
    { title: 'Total Users', value: '2,847', delta: '+12% vs last month', icon: Users, color: '#3b82f6' },
    { title: 'Events Held', value: '156', delta: '+8% vs last month', icon: Calendar, color: '#8b5cf6' },
    { title: 'Active Clubs', value: '24', delta: '+2 new this month', icon: Building2, color: '#10b981' },
    { title: 'Engagement Rate', value: '78%', delta: '+5% vs last month', icon: TrendingUp, color: '#f59e0b' },
  ]

  const topClubs = [
    { name: 'Tech Club', members: 156, events: 12, engagement: 92 },
    { name: 'Coding Club', members: 198, events: 20, engagement: 88 },
    { name: 'Health Club', members: 234, events: 15, engagement: 85 },
    { name: 'Drama Society', members: 89, events: 8, engagement: 82 },
    { name: 'Music Club', members: 67, events: 6, engagement: 78 },
  ]

  const recentActivity = [
    { action: 'New user registered', user: 'John Doe', time: '2 min ago' },
    { action: 'Event created', user: 'Tech Club', time: '15 min ago' },
    { action: 'Club joined', user: 'Sara M.', time: '1 hour ago' },
    { action: 'Event approved', user: 'Admin', time: '2 hours ago' },
    { action: 'Budget allocated', user: 'Admin', time: '3 hours ago' },
  ]

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard
              key={i}
              title={stat.title}
              value={stat.value}
              delta={stat.delta}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">User Growth</h2>
            <SmallChart
              data={[120, 150, 180, 220, 280, 350, 420, 480, 540, 620, 700, 780]}
              color="#3b82f6"
              height={200}
            />
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">Event Participation</h2>
            <SmallChart
              data={[45, 52, 38, 65, 72, 58, 80, 95, 88, 102, 115, 128]}
              color="#8b5cf6"
              height={200}
            />
          </div>
        </div>

        {/* Top Clubs & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border">
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold text-foreground">Top Performing Clubs</h2>
            </div>
            <div className="p-5">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Club</th>
                    <th className="text-center py-2 text-sm font-medium text-muted-foreground">Members</th>
                    <th className="text-center py-2 text-sm font-medium text-muted-foreground">Events</th>
                    <th className="text-right py-2 text-sm font-medium text-muted-foreground">Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {topClubs.map((club, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="py-3 text-sm text-foreground font-medium">{club.name}</td>
                      <td className="py-3 text-sm text-muted-foreground text-center">{club.members}</td>
                      <td className="py-3 text-sm text-muted-foreground text-center">{club.events}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${club.engagement}%` }}
                            />
                          </div>
                          <span className="text-sm text-foreground font-medium">{club.engagement}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border">
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold text-foreground">Recent Activity</h2>
            </div>
            <div className="divide-y divide-border">
              {recentActivity.map((activity, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Eye className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Engagement by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Technical', value: 45, color: '#3b82f6' },
              { name: 'Cultural', value: 28, color: '#8b5cf6' },
              { name: 'Sports', value: 18, color: '#10b981' },
              { name: 'Social', value: 9, color: '#f59e0b' },
            ].map((cat) => (
              <div key={cat.name} className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-2">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke={cat.color}
                      strokeWidth="8"
                      strokeDasharray={`${(cat.value / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-foreground">{cat.value}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
