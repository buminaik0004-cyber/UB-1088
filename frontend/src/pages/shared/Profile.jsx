import { useState } from 'react'
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react'
import useAuthStore from '../../store/authStore'

export default function Profile() {
  const { user, role } = useAuthStore()

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="page-title mb-8">Profile</h1>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-civic-600 flex items-center justify-center text-2xl font-display font-bold text-white">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-slate-100">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${role === 'authority' ? 'badge-acknowledged' : 'badge-resolved'}`}>
                {role === 'authority' ? <Shield size={11} /> : <User size={11} />}
                {role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: Mail, label: 'Email', val: user?.email },
            { icon: Phone, label: 'Phone', val: user?.phone || 'Not provided' },
            { icon: MapPin, label: 'Ward / Area', val: user?.ward || 'Not specified' },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="flex items-center gap-3 py-3 border-b border-slate-800 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <Icon size={15} className="text-slate-400" />
              </div>
              <div>
                <p className="font-display text-xs text-slate-500">{label}</p>
                <p className="font-body text-sm text-slate-200">{val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 border-amber-500/20 bg-amber-500/5">
        <p className="font-display font-semibold text-amber-400 text-sm mb-1">Account Settings</p>
        <p className="font-body text-slate-500 text-sm">
          Profile editing and password change features can be added in a future update. Contact your administrator for changes.
        </p>
      </div>
    </div>
  )
}
