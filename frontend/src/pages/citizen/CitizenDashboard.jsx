import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, AlertCircle, Clock, CheckCircle, Activity } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { issueService } from '../../services/issueService'
import IssueCard from '../../components/IssueCard'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function CitizenDashboard() {
  const { user } = useAuthStore()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      const res = await issueService.getMy()
      setIssues(res.data || [])
    } catch {}
    finally { setLoading(false) }
  }

  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === 'pending').length,
    in_progress: issues.filter((i) => i.status === 'in_progress' || i.status === 'acknowledged').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-body text-slate-500 text-sm mb-1">{greeting} 👋</p>
          <h1 className="page-title">{user?.name}</h1>
          <p className="font-body text-slate-500 mt-1">Track your reported issues and their status</p>
        </div>
        <Link to="/citizen/report" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Report Issue
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Reported', val: stats.total, icon: Activity, color: 'text-civic-400', bg: 'bg-civic-500/10' },
          { label: 'Pending', val: stats.pending, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'In Progress', val: stats.in_progress, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Resolved', val: stats.resolved, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((s) => (
          <div key={s.label} className="stat-card animate-slide-up">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <div className={`font-display font-bold text-2xl ${s.color}`}>{s.val}</div>
              <div className="font-body text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent issues */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Recent Reports</h2>
        <Link to="/citizen/complaints" className="text-sm text-civic-400 hover:text-civic-300 font-display">
          View all →
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : issues.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">🏙️</div>
          <h3 className="font-display font-semibold text-slate-300 mb-2">No issues reported yet</h3>
          <p className="font-body text-slate-500 text-sm mb-6">
            See a civic problem? Report it and help make your city better.
          </p>
          <Link to="/citizen/report" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Report Your First Issue
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.slice(0, 5).map((issue) => (
            <IssueCard key={issue.id} issue={issue} linkBase="/citizen" />
          ))}
        </div>
      )}
    </div>
  )
}
