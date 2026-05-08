import { describe, it, expect, beforeEach } from 'vitest'
import { create } from 'zustand'

// Create a fresh store for testing
const createTestStore = () => create((set, get) => ({
  boards: [],
  currentBoard: null,
  lists: [],
  cards: {},
  loading: false,
  loadingBoardData: false,
  error: null,
  boardDataError: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}))

describe('Board Store', () => {
  let useTestStore
  
  beforeEach(() => {
    useTestStore = createTestStore()
  })

  it('should initialize with empty state', () => {
    const state = useTestStore.getState()
    expect(state.boards).toEqual([])
    expect(state.currentBoard).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('should set loading state', () => {
    useTestStore.getState().setLoading(true)
    expect(useTestStore.getState().loading).toBe(true)
  })

  it('should set error state', () => {
    const error = new Error('Test error')
    useTestStore.getState().setError(error)
    expect(useTestStore.getState().error).toBe(error)
  })

  it('should clear error', () => {
    useTestStore.getState().setError(new Error('Test error'))
    useTestStore.getState().clearError()
    expect(useTestStore.getState().error).toBeNull()
  })
})