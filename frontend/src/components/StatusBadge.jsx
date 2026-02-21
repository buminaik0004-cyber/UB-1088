import { getCategoryInfo, getStatusInfo } from '../utils/helpers'

export function StatusBadge({ status }) {
  const labels = {
    pending: 'Pending',
    acknowledged: 'Acknowledged',
    in_progress: 'In Progress',
    resolved: 'Resolved',
  }
  const dots = {
    pending: 'bg-amber-400',
    acknowledged: 'bg-blue-400',
    in_progress: 'bg-purple-400',
    resolved: 'bg-emerald-400',
  }
  return (
    <span className={`badge-${status}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || 'bg-slate-400'}`} />
      {labels[status] || status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  return <span className={`badge-${priority}`}>{priority?.toUpperCase()}</span>
}

export function CategoryBadge({ category }) {
  const info = getCategoryInfo(category)
  return (
    <span className="badge bg-slate-800 text-slate-300 border border-slate-700">
      {info.icon} {info.label}
    </span>
  )
}
