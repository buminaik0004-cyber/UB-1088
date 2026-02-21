import { useEffect, useState } from 'react'
import { issueService } from '../../services/issueService'
import MapView from '../../components/MapView'
import { StatusBadge, CategoryBadge } from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import useAuthStore from '../../store/authStore'
import { formatTimeAgo } from '../../utils/helpers'

export default function MapPage() {
  const { role } = useAuthStore()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIssue, setSelectedIssue] = useState(null)

  useEffect(() => {
    const fetch = role === 'authority' ? issueService.getAll({}) : issueService.getMy()
    fetch.then((res) => setIssues(res.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [role])

  const issuesWithLocation = issues.filter((i) => i.location?.lat && i.location?.lng)

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title mb-1">Issue Map</h1>
        <p className="font-body text-slate-500">
          {role === 'authority' ? 'All reported issues across the city' : 'Your reported issues on the map'}
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { label: 'Pending', color: '#f59e0b' },
          { label: 'Acknowledged', color: '#3b82f6' },
          { label: 'In Progress', color: '#a855f7' },
          { label: 'Resolved', color: '#10b981' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-sm font-display text-slate-400">
            <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
        <span className="ml-auto font-body text-sm text-slate-500">{issuesWithLocation.length} pinned issues</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? <LoadingSpinner /> : (
            <MapView
              issues={issuesWithLocation}
              height="550px"
              onMarkerClick={setSelectedIssue}
            />
          )}
        </div>

        <div className="space-y-3">
          <h3 className="font-display font-semibold text-slate-300 text-sm">
            {selectedIssue ? 'Selected Issue' : 'Click a pin to view details'}
          </h3>
          {selectedIssue ? (
            <div className="card p-4 animate-slide-in-right">
              <h4 className="font-display font-semibold text-slate-100 mb-2">{selectedIssue.title}</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                <StatusBadge status={selectedIssue.status} />
                <CategoryBadge category={selectedIssue.category} />
              </div>
              <p className="font-body text-slate-400 text-sm mb-3 line-clamp-3">{selectedIssue.description}</p>
              {selectedIssue.location?.address && (
                <p className="font-body text-xs text-slate-500 mb-2">📍 {selectedIssue.location.address}</p>
              )}
              <p className="font-body text-xs text-slate-600">{formatTimeAgo(selectedIssue.reported_at)}</p>
            </div>
          ) : (
            <div className="card p-6 text-center">
              <div className="text-3xl mb-2">🗺️</div>
              <p className="font-body text-sm text-slate-500">Click on any marker on the map to see issue details here</p>
            </div>
          )}

          {/* Mini list */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {issuesWithLocation.slice(0, 10).map((issue) => (
              <button key={issue.id} onClick={() => setSelectedIssue(issue)}
                className={`w-full text-left card p-3 transition-all hover:border-civic-700/50 ${selectedIssue?.id === issue.id ? 'border-civic-500/40 bg-civic-500/5' : ''}`}>
                <p className="font-display font-medium text-sm text-slate-200 truncate">{issue.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={issue.status} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
