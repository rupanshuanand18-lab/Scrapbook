/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'
import { books as initialBooks, memories as initialMemories } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [books, setBooks] = useState(initialBooks)
  const [memories, setMemories] = useState(initialMemories)

  const login = useCallback((email) => {
    setUser({
      id: 'u1',
      name: 'Priya Sharma',
      email: email || 'priya@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    })
  }, [])

  const logout = useCallback(() => setUser(null), [])

  const updateUser = useCallback((updates) => {
    setUser((prev) => ({
      ...(prev || { id: 'u1', email: 'priya@example.com' }),
      ...updates,
    }))
  }, [])

  const signup = useCallback((name, email) => {
    setUser({
      id: 'u1',
      name: name || 'New User',
      email: email || 'user@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    })
  }, [])

  const addBook = useCallback((book) => {
    const newBook = {
      ...book,
      id: `b${Date.now()}`,
      memoryCount: 0,
      ownerId: 'u1',
      collaboratorIds: ['u1'],
      createdAt: new Date().toISOString().split('T')[0],
    }
    setBooks((prev) => [newBook, ...prev])
    return newBook
  }, [])

  const addMemory = useCallback((memory) => {
    const newMemory = { ...memory, id: `m${Date.now()}` }
    setMemories((prev) => [newMemory, ...prev])
    setBooks((prev) =>
      prev.map((b) =>
        b.id === memory.bookId ? { ...b, memoryCount: b.memoryCount + 1 } : b
      )
    )
    return newMemory
  }, [])

  const getBookMemories = useCallback(
    (bookId) => memories.filter((m) => m.bookId === bookId),
    [memories]
  )

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        updateUser,
        books,
        memories,
        addBook,
        addMemory,
        getBookMemories,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
