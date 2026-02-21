export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      <p className="text-slate-500 font-body text-sm">{text}</p>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-civic-500/20 border-t-civic-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-display text-sm">Loading CivicSync...</p>
      </div>
    </div>
  )
}
