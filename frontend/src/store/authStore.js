import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRole: (role) => set({ role }),
      setLoading: (isLoading) => set({ isLoading }),

      login: (userData, token) => set({
        user: userData,
        token,
        role: userData.role,
      }),

      logout: () => set({ user: null, token: null, role: null }),

      isAuthenticated: () => !!get().token,
      isCitizen: () => get().role === 'citizen',
      isAuthority: () => get().role === 'authority',
    }),
    {
      name: 'civic-auth',
      partialize: (state) => ({ user: state.user, token: state.token, role: state.role }),
    }
  )
)

export default useAuthStore
