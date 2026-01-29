'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import StatCard from '@/components/common/StatCard'
import SmallChart from '@/components/common/SmallChart'
import { DollarSign, TrendingUp, TrendingDown, PieChart, Plus } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'

interface BudgetItem {
  id: string
  club: string
  event: string
  amount: number
  type: 'allocation' | 'expense'
  status: string
  date: string
}

export default function BudgetPage() {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newAllocation, setNewAllocation] = useState({
    club: '',
    event: '',
    amount: '',
    type: 'allocation' as const,
  })

  const totalBudget = 50000
  const allocated = 35000
  const spent = 26600
  const remaining = totalBudget - spent

  useEffect(() => {
    fetchBudgetItems()
  }, [])

  const fetchBudgetItems = async () => {
    try {
      const budgetSnapshot = await getDocs(collection(db, 'budget'))
      const items = budgetSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BudgetItem[]
      setBudgetItems(items)
    } catch (error) {
      console.error('Error fetching budget items:', error)
      // Set mock data on error
      setBudgetItems([
        { id: '1', club: 'Tech Club', event: 'Tech Summit 2024', amount: 5000, type: 'allocation', status: 'approved', date: 'Jan 15' },
        { id: '2', club: 'Drama Society', event: 'Annual Play', amount: 3000, type: 'expense', status: 'completed', date: 'Jan 20' },
        { id: '3', club: 'Health Club', event: 'Marathon', amount: 2500, type: 'allocation', status: 'pending', date: 'Feb 01' },
        { id: '4', club: 'Music Club', event: 'Concert Night', amount: 4000, type: 'expense', status: 'completed', date: 'Feb 10' },
        { id: '5', club: 'Coding Club', event: 'Hackathon', amount: 6000, type: 'allocation', status: 'approved', date: 'Feb 15' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, 'budget'), {
        ...newAllocation,
        amount: parseFloat(newAllocation.amount),
        status: 'pending',
        createdAt: serverTimestamp(),
      })
      setShowModal(false)
      setNewAllocation({ club: '', event: '', amount: '', type: 'allocation' })
      fetchBudgetItems()
    } catch (error) {
      console.error('Error creating allocation:', error)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Budget Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Allocation
          </button>
        </div>

        {/* Budget Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Budget"
            value={`$${totalBudget.toLocaleString()}`}
            delta="This semester"
            icon={DollarSign}
            color="#3b82f6"
          />
          <StatCard
            title="Allocated"
            value={`$${allocated.toLocaleString()}`}
            delta={`${((allocated / totalBudget) * 100).toFixed(0)}% of total`}
            icon={PieChart}
            color="#8b5cf6"
          />
          <StatCard
            title="Spent"
            value={`$${spent.toLocaleString()}`}
            delta={`${((spent / allocated) * 100).toFixed(0)}% of allocated`}
            icon={TrendingDown}
            color="#ef4444"
          />
          <StatCard
            title="Remaining"
            value={`$${remaining.toLocaleString()}`}
            delta={`${((remaining / totalBudget) * 100).toFixed(0)}% available`}
            icon={TrendingUp}
            color="#10b981"
          />
        </div>

        {/* Budget Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">Spending Trends</h2>
            <SmallChart
              data={[2000, 3500, 2800, 4200, 3800, 5100, 4500, 6200, 5800, 7000]}
              color="#3b82f6"
              height={200}
            />
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">Budget Breakdown</h2>
            <div className="space-y-4">
              {[
                { name: 'Tech Clubs', amount: 12000, color: '#3b82f6' },
                { name: 'Cultural', amount: 8000, color: '#8b5cf6' },
                { name: 'Sports', amount: 6000, color: '#10b981' },
                { name: 'Others', amount: 9000, color: '#f59e0b' },
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium text-foreground">${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(item.amount / allocated) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget Transactions */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Club</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Event</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {budgetItems.map((item) => (
                  <tr key={item.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-sm text-foreground">{item.club}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{item.event}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                          item.type === 'allocation'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      ${item.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                          item.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : item.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Allocation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-foreground mb-4">New Budget Allocation</h2>
              <form onSubmit={handleCreateAllocation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Club</label>
                  <input
                    type="text"
                    value={newAllocation.club}
                    onChange={(e) => setNewAllocation({ ...newAllocation, club: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Event</label>
                  <input
                    type="text"
                    value={newAllocation.event}
                    onChange={(e) => setNewAllocation({ ...newAllocation, event: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Amount ($)</label>
                  <input
                    type="number"
                    value={newAllocation.amount}
                    onChange={(e) => setNewAllocation({ ...newAllocation, amount: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
