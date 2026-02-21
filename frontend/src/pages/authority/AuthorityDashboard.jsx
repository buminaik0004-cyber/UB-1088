import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Clock, CheckCircle, Activity, TrendingUp, Users } from 'lucide-react'
import { analyticsService, issueService } from '../../services/issueService'
import IssueCard from '../../components/IssueCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import useAuthStore from '../../store/authStore'

export default function AuthorityDashboard() {
  const { user } = useAuthStore()
  const [issues, setIssues] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchIssues(), fetchStats()])
  }, [])

  const fetchIssues = async () => {
    try {
      const res = await issueService.getAll({ limit: 5 })
      setIssues(res.data || [])
    } catch {}
  }

  const fetchStats = async () => {
    try {
      const res = await analyticsService.getSummary()
      setStats(res.data)
    } catch {} finally { setLoading(false) }
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="font-body text-slate-500 text-sm mb-1">Authority Dashboard</p>
        <h1 className="page-title">Welcome, {user?.name} 👋</h1>
        <p className="font-body text-slate-500 mt-1">Manage and resolve civic issues across the city</p>
      </div>

      {/* Stats */}
      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total', val: stats?.total || 0, icon: Activity, color: 'text-civic-400', bg: 'bg-civic-500/10' },
            { label: 'Pending', val: stats?.pending || 0, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Acknowledged', val: stats?.acknowledged || 0, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'In Progress', val: stats?.in_progress || 0, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Resolved', val: stats?.resolved || 0, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'This Week', val: stats?.this_week || 0, icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/10' },
          ].map((s) => (
            <div key={s.label} className="card p-4 flex flex-col items-center text-center animate-slide-up">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                <s.icon size={16} className={s.color} />
              </div>
              <div className={`font-display font-bold text-2xl ${s.color}`}>{s.val}</div>
              <div className="font-body text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution rate */}
      {stats && (
        <div className="card p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="font-display font-semibold text-slate-300 text-sm">Resolution Rate</span>
            <span className="font-display font-bold text-emerald-400">
              {stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-civic-500 to-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${stats.total ? (stats.resolved / stats.total) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs font-body text-slate-600">
            <span>{stats.resolved} resolved</span>
            <span>{stats.total - stats.resolved} remaining</span>
          </div>
        </div>
      )}

      {/* Recent issues */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Recent Issues</h2>
        <Link to="/authority/issues" className="text-sm text-civic-400 hover:text-civic-300 font-display">
          View all →
        </Link>
      </div>

      <div className="space-y-3">
        {issues.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="font-display font-semibold text-slate-300">No issues yet</h3>
            <p className="text-slate-500 text-sm font-body mt-1">All clear! Issues reported by citizens will appear here.</p>
          </div>
        ) : (
          issues.map((issue) => <IssueCard key={issue.id} issue={issue} linkBase="/authority" />)
        )}
      </div>
    </div>
  )
}
