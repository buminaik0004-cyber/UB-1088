import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, MapPin, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../../services/authService'
import useAuthStore from '../../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authService.login(form)
      login(res.data.user, res.data.token)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate(res.data.user.role === 'citizen' ? '/citizen/dashboard' : '/authority/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-900 border-r border-slate-800 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-civic-900/30 via-transparent to-purple-900/20" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-civic-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 bg-civic-600 rounded-xl flex items-center justify-center">
              <MapPin size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">
              Civic<span className="text-civic-400">Sync</span>
            </span>
          </div>

          <h1 className="font-display font-bold text-4xl text-white leading-tight mb-4">
            Report. Track.<br />
            <span className="text-civic-400">Resolve.</span>
          </h1>
          <p className="font-body text-slate-400 text-lg leading-relaxed">
            Empowering citizens to report civic issues and enabling authorities to resolve them efficiently.
          </p>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-4">
          {[
            { label: 'Issues Reported', val: '2.4K+' },
            { label: 'Resolved', val: '89%' },
            { label: 'Avg Resolution', val: '3 Days' },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <div className="font-display font-bold text-2xl text-civic-400">{s.val}</div>
              <div className="font-body text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-civic-600 rounded-lg flex items-center justify-center">
              <MapPin size={15} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">
              Civic<span className="text-civic-400">Sync</span>
            </span>
          </div>

          <h2 className="font-display font-bold text-3xl text-slate-100 mb-1">Welcome back</h2>
          <p className="font-body text-slate-500 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-6">
              {loading ? <div className="spinner" /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center font-body text-slate-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-civic-400 hover:text-civic-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
