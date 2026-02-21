import { create } from 'zustand'

const useIssueStore = create((set) => ({
  issues: [],
  myIssues: [],
  selectedIssue: null,
  filters: { status: '', category: '', priority: '', search: '' },
  isLoading: false,
  stats: null,

  setIssues: (issues) => set({ issues }),
  setMyIssues: (myIssues) => set({ myIssues }),
  setSelectedIssue: (selectedIssue) => set({ selectedIssue }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setLoading: (isLoading) => set({ isLoading }),
  setStats: (stats) => set({ stats }),

  addIssue: (issue) => set((state) => ({ issues: [issue, ...state.issues] })),
  updateIssue: (id, updates) => set((state) => ({
    issues: state.issues.map((i) => i.id === id ? { ...i, ...updates } : i),
    myIssues: state.myIssues.map((i) => i.id === id ? { ...i, ...updates } : i),
  })),
}))

export default useIssueStore
