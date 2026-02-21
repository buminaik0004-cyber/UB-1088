import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, MapPin, ArrowRight, User, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../../services/authService'
import useAuthStore from '../../store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'citizen', phone: '', ward: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const res = await authService.register(form)
      login(res.data.user, res.data.token)
      toast.success(`Welcome to CivicSync, ${res.data.user.name}!`)
      navigate(res.data.user.role === 'citizen' ? '/citizen/dashboard' : '/authority/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-civic-600 rounded-xl flex items-center justify-center">
            <MapPin size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">
            Civic<span className="text-civic-400">Sync</span>
          </span>
        </div>

        <h2 className="font-display font-bold text-3xl text-slate-100 mb-1">Create account</h2>
        <p className="font-body text-slate-500 mb-8">Join CivicSync and start making your city better</p>

        {/* Role selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { value: 'citizen', label: 'Citizen', desc: 'Report & track issues', icon: User },
            { value: 'authority', label: 'Authority', desc: 'Manage & resolve issues', icon: Shield },
          ].map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm({ ...form, role: value })}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                form.role === value
                  ? 'border-civic-500/60 bg-civic-500/10 shadow-glow'
                  : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
              }`}
            >
              <Icon size={18} className={form.role === value ? 'text-civic-400' : 'text-slate-500'} />
              <div className="font-display font-semibold text-sm text-slate-100 mt-2">{label}</div>
              <div className="font-body text-xs text-slate-500 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" placeholder="John Doe" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <input className="input-field" placeholder="+91 98765 43210" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">Email address</label>
            <input type="email" className="input-field" placeholder="you@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          {form.role === 'citizen' && (
            <div>
              <label className="label">Ward / Area (optional)</label>
              <input className="input-field" placeholder="e.g., Ward 12, Koramangala" value={form.ward}
                onChange={(e) => setForm({ ...form, ward: e.target.value })} />
            </div>
          )}

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading ? <div className="spinner" /> : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="text-center font-body text-slate-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-civic-400 hover:text-civic-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
