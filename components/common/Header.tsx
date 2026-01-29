'use client'

import { Menu, Search, Bell, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'

interface HeaderProps {
  onToggleSidebar: () => void
  userName?: string
}

export default function Header({ onToggleSidebar, userName = 'User' }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-xl font-bold text-foreground">Unified Campus</div>
      </div>

      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            placeholder="Search clubs, events, users..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
        <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
          {initials}
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
