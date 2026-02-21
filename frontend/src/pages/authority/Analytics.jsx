import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'
import { analyticsService } from '../../services/issueService'
import LoadingSpinner from '../../components/LoadingSpinner'

const COLORS = ['#f59e0b', '#3b82f6', '#a855f7', '#10b981', '#f43f5e', '#06b6d4', '#84cc16']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-sm shadow-xl">
      <p className="font-display font-semibold text-slate-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-body">{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [byCategory, setByCategory] = useState([])
  const [byWeek, setByWeek] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsService.getSummary(),
      analyticsService.getByCategory(),
      analyticsService.getByWeek(),
    ]).then(([s, c, w]) => {
      setSummary(s.data)
      setByCategory(c.data || [])
      setByWeek(w.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="Loading analytics..." />

  const pieData = summary ? [
    { name: 'Pending', value: summary.pending },
    { name: 'Acknowledged', value: summary.acknowledged },
    { name: 'In Progress', value: summary.in_progress },
    { name: 'Resolved', value: summary.resolved },
  ].filter((d) => d.value > 0) : []

  const resolutionRate = summary?.total ? Math.round((summary.resolved / summary.total) * 100) : 0

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title mb-1">Analytics</h1>
        <p className="font-body text-slate-500">City-wide civic issue insights and trends</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Issues', val: summary?.total || 0, color: 'text-civic-400' },
          { label: 'Resolution Rate', val: `${resolutionRate}%`, color: 'text-emerald-400' },
          { label: 'Open Issues', val: (summary?.total || 0) - (summary?.resolved || 0), color: 'text-amber-400' },
          { label: 'This Week', val: summary?.this_week || 0, color: 'text-purple-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-5 text-center">
            <div className={`font-display font-bold text-3xl ${kpi.color} mb-1`}>{kpi.val}</div>
            <div className="font-body text-sm text-slate-500">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Issues by category */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-slate-200 mb-4">Issues by Category</h3>
          {byCategory.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-600 font-body text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byCategory} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status distribution */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-slate-200 mb-4">Status Distribution</h3>
          {pieData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-600 font-body text-sm">No data yet</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="font-body text-slate-400">{d.name}</span>
                    <span className="font-display font-bold text-slate-200 ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weekly trend */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-slate-200 mb-4">Weekly Trend (Last 8 Weeks)</h3>
        {byWeek.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-slate-600 font-body text-sm">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={byWeek} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: 12, color: '#94a3b8' }} />
              <Line type="monotone" dataKey="reported" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9', r: 4 }} name="Reported" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
