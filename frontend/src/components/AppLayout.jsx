import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, List, Map, BarChart3, User, MapPin, LogOut, Shield } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AppLayout() {
  const { user, role, logout } = useAuthStore()
  const navigate = useNavigate()

  const citizenLinks = [
    { to: '/citizen/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/citizen/report', icon: PlusCircle, label: 'Report Issue' },
    { to: '/citizen/complaints', icon: List, label: 'My Complaints' },
    { to: '/map', icon: Map, label: 'Map View' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  const authorityLinks = [
    { to: '/authority/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/authority/issues', icon: List, label: 'All Issues' },
    { to: '/authority/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/map', icon: Map, label: 'Map View' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  const links = role === 'authority' ? authorityLinks : citizenLinks

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-slate-900/80 border-r border-slate-800/60 backdrop-blur-sm flex flex-col fixed left-0 top-0 bottom-0 z-40">
        {/* Logo */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-civic-600 rounded-lg flex items-center justify-center">
              <MapPin size={15} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">
              Civic<span className="text-civic-400">Sync</span>
            </span>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60">
            <div className="w-7 h-7 rounded-lg bg-civic-600 flex items-center justify-center text-xs font-bold text-white font-display">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-sm text-slate-200 truncate">{user?.name?.split(' ')[0]}</p>
              <p className="font-body text-xs text-slate-500 capitalize">{role}</p>
            </div>
            {role === 'authority' && <Shield size={12} className="text-purple-400 flex-shrink-0" />}
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-800">
          <button onClick={handleLogout}
            className="sidebar-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
