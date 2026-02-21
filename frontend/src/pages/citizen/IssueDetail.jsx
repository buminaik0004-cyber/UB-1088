import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, User, Building2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { issueService } from '../../services/issueService'
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/StatusBadge'
import MapView from '../../components/MapView'
import LoadingSpinner from '../../components/LoadingSpinner'
import useAuthStore from '../../store/authStore'
import { formatDate, formatTimeAgo, ISSUE_STATUSES, DEPARTMENTS } from '../../utils/helpers'

export default function IssueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role } = useAuthStore()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [statusForm, setStatusForm] = useState({ status: '', note: '' })
  const [assignForm, setAssignForm] = useState({ department: '' })

  useEffect(() => { fetchIssue() }, [id])

  const fetchIssue = async () => {
    try {
      const res = await issueService.getById(id)
      setIssue(res.data)
      setStatusForm({ status: res.data.status, note: '' })
      setAssignForm({ department: res.data.assigned_to || '' })
    } catch { toast.error('Issue not found') }
    finally { setLoading(false) }
  }

  const handleStatusUpdate = async () => {
    setUpdating(true)
    try {
      await issueService.updateStatus(id, statusForm)
      toast.success('Status updated!')
      fetchIssue()
    } catch { toast.error('Failed to update status') }
    finally { setUpdating(false) }
  }

  const handleAssign = async () => {
    setUpdating(true)
    try {
      await issueService.assign(id, assignForm)
      toast.success('Issue assigned!')
      fetchIssue()
    } catch { toast.error('Failed to assign') }
    finally { setUpdating(false) }
  }

  if (loading) return <LoadingSpinner />
  if (!issue) return <div className="text-center text-slate-400 py-20">Issue not found</div>

  const statusOrder = ['pending', 'acknowledged', 'in_progress', 'resolved']
  const currentStatusIdx = statusOrder.indexOf(issue.status)

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-100 mb-6 transition-colors font-display text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h1 className="font-display font-bold text-xl text-slate-100 mb-2">{issue.title}</h1>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={issue.status} />
                  <PriorityBadge priority={issue.priority} />
                  <CategoryBadge category={issue.category} />
                </div>
              </div>
              <span className="font-mono text-xs text-slate-600 bg-slate-800 px-2 py-1 rounded-lg">#{id.slice(-8)}</span>
            </div>

            <p className="font-body text-slate-400 text-sm leading-relaxed">{issue.description}</p>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-sm font-body text-slate-500">
                <User size={14} /> <span>{issue.reported_by_name || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-body text-slate-500">
                <Clock size={14} /> <span>{formatTimeAgo(issue.reported_at)}</span>
              </div>
              {issue.location?.address && (
                <div className="flex items-start gap-2 text-sm font-body text-slate-500 col-span-2">
                  <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                  <span>{issue.location.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          {issue.images?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display font-semibold text-slate-300 text-sm mb-3">Photos ({issue.images.length})</h3>
              <div className="grid grid-cols-3 gap-2">
                {issue.images.map((img, i) => (
                  <a key={i} href={img} target="_blank" rel="noreferrer">
                    <img src={img} alt={`issue-${i}`} className="w-full h-28 object-cover rounded-xl border border-slate-700 hover:opacity-80 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {issue.location?.lat && (
            <div className="card p-5">
              <h3 className="font-display font-semibold text-slate-300 text-sm mb-3">Location</h3>
              <MapView issues={[issue]} center={[issue.location.lat, issue.location.lng]} zoom={15} height="250px" />
            </div>
          )}

          {/* Status timeline */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-slate-300 text-sm mb-4">Status Timeline</h3>
            <div>
              {statusOrder.map((status, i) => {
                const done = i <= currentStatusIdx
                const current = i === currentStatusIdx
                const history = issue.status_history?.find((h) => h.status === status)
                return (
                  <div key={status} className="timeline-step">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10
                      ${done ? 'bg-civic-500' : 'bg-slate-800 border border-slate-700'}`}>
                      {done ? <CheckCircle size={14} className="text-white" /> : (
                        <span className="w-2 h-2 rounded-full bg-slate-600" />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className={`font-display font-semibold text-sm ${done ? 'text-slate-100' : 'text-slate-600'}`}>
                        {status.replace('_', ' ').toUpperCase()}
                        {current && <span className="ml-2 text-civic-400 text-xs">(current)</span>}
                      </p>
                      {history && (
                        <>
                          <p className="text-slate-500 text-xs font-body mt-0.5">{formatDate(history.updated_at)}</p>
                          {history.note && <p className="text-slate-400 text-xs font-body mt-1 italic">"{history.note}"</p>}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Issue meta */}
          <div className="card p-5 space-y-3">
            <h3 className="font-display font-semibold text-slate-300 text-sm">Issue Details</h3>
            {[
              { label: 'ID', val: `#${id.slice(-8)}` },
              { label: 'Reported', val: formatDate(issue.reported_at) },
              { label: 'Department', val: issue.assigned_to || 'Unassigned' },
              issue.resolved_at && { label: 'Resolved', val: formatDate(issue.resolved_at) },
            ].filter(Boolean).map(({ label, val }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500 font-display">{label}</span>
                <span className="text-slate-300 font-body">{val}</span>
              </div>
            ))}
            {issue.resolution_note && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-500 font-display text-xs">Resolution Note</span>
                <p className="text-slate-300 text-sm font-body mt-1">{issue.resolution_note}</p>
              </div>
            )}
          </div>

          {/* Authority actions */}
          {role === 'authority' && (
            <>
              <div className="card p-5 space-y-3">
                <h3 className="font-display font-semibold text-slate-300 text-sm">Update Status</h3>
                <select className="input-field" value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}>
                  {ISSUE_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <textarea className="input-field resize-none" rows={3} placeholder="Add a note (optional)..."
                  value={statusForm.note} onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })} />
                <button onClick={handleStatusUpdate} disabled={updating} className="btn-primary w-full flex items-center justify-center gap-2">
                  {updating ? <div className="spinner" /> : 'Update Status'}
                </button>
              </div>

              <div className="card p-5 space-y-3">
                <h3 className="font-display font-semibold text-slate-300 text-sm">Assign Department</h3>
                <select className="input-field" value={assignForm.department}
                  onChange={(e) => setAssignForm({ department: e.target.value })}>
                  <option value="">Select department...</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                <button onClick={handleAssign} disabled={updating} className="btn-secondary w-full flex items-center justify-center gap-2">
                  {updating ? <div className="spinner" /> : <><Building2 size={14} /> Assign</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
