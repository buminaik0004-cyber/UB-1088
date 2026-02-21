import { useEffect, useState, useCallback } from 'react'
import { Search, Filter, RefreshCw } from 'lucide-react'
import { issueService } from '../../services/issueService'
import IssueCard from '../../components/IssueCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ISSUE_CATEGORIES, ISSUE_STATUSES, PRIORITIES } from '../../utils/helpers'

export default function AllIssues() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' })

  useEffect(() => { fetchIssues() }, [])

  const fetchIssues = async () => {
    setLoading(true)
    try {
      const res = await issueService.getAll(filters)
      setIssues(res.data || [])
    } catch {} finally { setLoading(false) }
  }

  const filtered = issues.filter((i) => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.location?.address?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filters.status || i.status === filters.status
    const matchCat = !filters.category || i.category === filters.category
    const matchPri = !filters.priority || i.priority === filters.priority
    return matchSearch && matchStatus && matchCat && matchPri
  })

  const updateFilter = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }))

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title mb-1">All Issues</h1>
          <p className="font-body text-slate-500">Manage and resolve all civic reports</p>
        </div>
        <button onClick={fetchIssues} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input-field pl-9" placeholder="Search by title or location..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <select className="input-field" value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
            <option value="">All Statuses</option>
            {ISSUE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="input-field" value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
            <option value="">All Categories</option>
            {ISSUE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
          </select>
          <select className="input-field" value={filters.priority} onChange={(e) => updateFilter('priority', e.target.value)}>
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          <p className="text-slate-500 text-sm font-body">{filtered.length} issue{filtered.length !== 1 ? 's' : ''} found</p>
          {filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-display font-semibold text-slate-400">No issues match your filters</p>
            </div>
          ) : (
            filtered.map((issue) => <IssueCard key={issue.id} issue={issue} linkBase="/authority" />)
          )}
        </div>
      )}
    </div>
  )
}
