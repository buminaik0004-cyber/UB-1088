import { format, formatDistanceToNow } from 'date-fns'

export const ISSUE_CATEGORIES = [
  { value: 'pothole', label: 'Pothole', icon: '🕳️' },
  { value: 'garbage', label: 'Garbage Overflow', icon: '🗑️' },
  { value: 'streetlight', label: 'Broken Streetlight', icon: '💡' },
  { value: 'water_leakage', label: 'Water Leakage', icon: '💧' },
  { value: 'road_damage', label: 'Road Damage', icon: '🚧' },
  { value: 'drainage', label: 'Drainage Problem', icon: '🌊' },
  { value: 'encroachment', label: 'Encroachment', icon: '🏗️' },
  { value: 'other', label: 'Other', icon: '📋' },
]

export const ISSUE_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'amber' },
  { value: 'acknowledged', label: 'Acknowledged', color: 'blue' },
  { value: 'in_progress', label: 'In Progress', color: 'purple' },
  { value: 'resolved', label: 'Resolved', color: 'emerald' },
]

export const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export const DEPARTMENTS = [
  { value: 'roads', label: 'Roads & Infrastructure' },
  { value: 'sanitation', label: 'Sanitation & Garbage' },
  { value: 'electrical', label: 'Electrical & Lighting' },
  { value: 'water', label: 'Water Supply' },
  { value: 'general', label: 'General Administration' },
]

export const getCategoryInfo = (val) =>
  ISSUE_CATEGORIES.find((c) => c.value === val) || { label: val, icon: '📋' }

export const getStatusInfo = (val) =>
  ISSUE_STATUSES.find((s) => s.value === val) || { label: val, color: 'slate' }

export const formatDate = (ts) => {
  if (!ts) return 'N/A'
  const date = ts?.toDate ? ts.toDate() : new Date(ts)
  return format(date, 'MMM dd, yyyy')
}

export const formatTimeAgo = (ts) => {
  if (!ts) return 'N/A'
  const date = ts?.toDate ? ts.toDate() : new Date(ts)
  return formatDistanceToNow(date, { addSuffix: true })
}

export const STATUS_MARKER_COLOR = {
  pending: '#f59e0b',
  acknowledged: '#3b82f6',
  in_progress: '#a855f7',
  resolved: '#10b981',
}
