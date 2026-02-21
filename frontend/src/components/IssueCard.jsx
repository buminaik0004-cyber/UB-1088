import { Link } from 'react-router-dom'
import { MapPin, Clock, ChevronRight } from 'lucide-react'
import { StatusBadge, PriorityBadge, CategoryBadge } from './StatusBadge'
import { formatTimeAgo, getCategoryInfo } from '../utils/helpers'

export default function IssueCard({ issue, linkBase = '/citizen' }) {
  return (
    <Link
      to={`${linkBase}/issue/${issue.id}`}
      className="card-hover p-4 block animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Category icon */}
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg flex-shrink-0">
            {getCategoryInfo(issue.category).icon}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-slate-100 text-sm truncate">{issue.title}</h3>
            <p className="text-slate-500 text-xs font-body mt-0.5 line-clamp-1">{issue.description}</p>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
              <CategoryBadge category={issue.category} />
            </div>

            <div className="flex items-center gap-3 mt-2">
              {issue.location?.address && (
                <span className="flex items-center gap-1 text-xs text-slate-500 font-body">
                  <MapPin size={11} />
                  <span className="truncate max-w-[150px]">{issue.location.address}</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-600 font-body">
                <Clock size={11} />
                {formatTimeAgo(issue.reported_at)}
              </span>
            </div>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-600 flex-shrink-0 mt-1" />
      </div>

      {/* Image preview */}
      {issue.images?.length > 0 && (
        <div className="mt-3 flex gap-2">
          {issue.images.slice(0, 3).map((img, i) => (
            <img
              key={i}
              src={img}
              alt="issue"
              className="w-16 h-16 object-cover rounded-lg border border-slate-700"
            />
          ))}
          {issue.images.length > 3 && (
            <div className="w-16 h-16 rounded-lg border border-slate-700 bg-slate-800 flex items-center justify-center text-xs text-slate-400 font-display">
              +{issue.images.length - 3}
            </div>
          )}
        </div>
      )}
    </Link>
  )
}
