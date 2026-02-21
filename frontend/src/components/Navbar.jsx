import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Bell, LogOut, Menu, X, MapPin, ChevronDown } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { notificationService } from '../services/issueService'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, role, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [location.pathname])

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll()
      setNotifications(res.data || [])
      setUnread(res.data?.filter((n) => !n.is_read).length || 0)
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnread(0)
    } catch {}
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const navLinks = role === 'citizen'
    ? [
        { to: '/citizen/dashboard', label: 'Dashboard' },
        { to: '/citizen/report', label: 'Report Issue' },
        { to: '/citizen/complaints', label: 'My Complaints' },
        { to: '/map', label: 'Map' },
      ]
    : [
        { to: '/authority/dashboard', label: 'Dashboard' },
        { to: '/authority/issues', label: 'All Issues' },
        { to: '/authority/analytics', label: 'Analytics' },
        { to: '/map', label: 'Map' },
      ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-civic-600 rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">
              Civic<span className="text-civic-400">Sync</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-display font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'text-civic-400 bg-civic-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-civic-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 card shadow-2xl animate-slide-up z-50 overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <span className="font-display font-semibold text-sm text-slate-100">Notifications</span>
                    {unread > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-civic-400 hover:text-civic-300">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-8 font-body">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 border-b border-slate-800/60 text-sm font-body ${!n.is_read ? 'bg-civic-500/5' : ''}`}
                        >
                          <p className="text-slate-300">{n.message}</p>
                          <p className="text-slate-600 text-xs mt-0.5">{n.created_at}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
              <div className="w-6 h-6 rounded-lg bg-civic-600 flex items-center justify-center text-xs font-bold text-white font-display">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-display font-medium text-slate-300">{user?.name?.split(' ')[0]}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-display ${role === 'authority' ? 'bg-purple-500/20 text-purple-400' : 'bg-civic-500/20 text-civic-400'}`}>
                {role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-slate-800 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-sm font-display font-medium mb-1 transition-all ${
                  location.pathname === link.to
                    ? 'text-civic-400 bg-civic-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
