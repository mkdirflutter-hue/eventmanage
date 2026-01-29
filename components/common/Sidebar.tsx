'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Building2,
  DollarSign,
  BarChart3,
  Settings,
  MessageSquare,
  FileText,
  ClipboardCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed: boolean
  role: 'admin' | 'organizer' | 'student'
}

const adminLinks = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/admin/approvals', label: 'Approvals', icon: ClipboardCheck },
  { href: '/dashboard/admin/clubs', label: 'Clubs', icon: Building2 },
  { href: '/dashboard/admin/events', label: 'Events', icon: Calendar },
  { href: '/dashboard/admin/students', label: 'Students', icon: Users },
  { href: '/dashboard/admin/budget', label: 'Budget', icon: DollarSign },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
]

const organizerLinks = [
  { href: '/dashboard/organizer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/organizer/clubs', label: 'My Clubs', icon: Building2 },
  { href: '/dashboard/organizer/events', label: 'Event Requests', icon: FileText },
  { href: '/dashboard/organizer/chat', label: 'Chat', icon: MessageSquare },
  { href: '/dashboard/organizer/settings', label: 'Settings', icon: Settings },
]

const studentLinks = [
  { href: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/student/clubs', label: 'Clubs', icon: Building2 },
  { href: '/dashboard/student/events', label: 'Events', icon: Calendar },
  { href: '/dashboard/student/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ collapsed, role }: SidebarProps) {
  const pathname = usePathname()

  const links =
    role === 'admin' ? adminLinks : role === 'organizer' ? organizerLinks : studentLinks

  return (
    <aside
      className={cn(
        'bg-card border-r border-border h-[calc(100vh-64px)] sticky top-16 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <nav className="p-3">
        <ul className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{link.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
