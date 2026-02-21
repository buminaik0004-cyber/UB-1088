import { useEffect, useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { issueService } from '../../services/issueService'
import IssueCard from '../../components/IssueCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ISSUE_CATEGORIES, ISSUE_STATUSES } from '../../utils/helpers'

export default function MyComplaints() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      const res = await issueService.getMy()
      setIssues(res.data || [])
    } catch {} finally { setLoading(false) }
  }

  const filtered = issues.filter((i) => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || i.status === statusFilter
    const matchCat = !categoryFilter || i.category === categoryFilter
    return matchSearch && matchStatus && matchCat
  })

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title mb-1">My Complaints</h1>
        <p className="font-body text-slate-500">Track all issues you've reported</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input-field pl-9" placeholder="Search by title..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <select className="input-field flex-1" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {ISSUE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="input-field flex-1" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {ISSUE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-display font-semibold text-slate-300 mb-1">No issues found</h3>
          <p className="text-slate-500 text-sm font-body">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-slate-500 text-sm font-body">{filtered.length} issue{filtered.length !== 1 ? 's' : ''} found</p>
          {filtered.map((issue) => (
            <IssueCard key={issue.id} issue={issue} linkBase="/citizen" />
          ))}
        </div>
      )}
    </div>
  )
}
