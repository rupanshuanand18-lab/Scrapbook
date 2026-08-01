/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'
import { books as initialBooks, memories as initialMemories, users as initialUsers } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [allUsers, setAllUsers] = useState(initialUsers)
  const [user, setUser] = useState(null)
  const [books, setBooks] = useState(initialBooks)
  const [memories, setMemories] = useState(initialMemories)

  // Follow relationships: { followerId, followingId }
  const [followRelations, setFollowRelations] = useState([
    { followerId: 'u2', followingId: 'u1' }, // Arjun follows Priya
    { followerId: 'u3', followingId: 'u1' }, // Sneha follows Priya
    { followerId: 'u4', followingId: 'u1' }, // Rahul follows Priya
    { followerId: 'u5', followingId: 'u1' }, // Ayush follows Priya
    { followerId: 'u6', followingId: 'u1' }, // Aarav follows Priya
    { followerId: 'u1', followingId: 'u2' }, // Priya follows Arjun
    { followerId: 'u1', followingId: 'u3' }, // Priya follows Sneha
    { followerId: 'u1', followingId: 'u6' }, // Priya follows Aarav
    { followerId: 'u2', followingId: 'u3' }, // Arjun follows Sneha
    { followerId: 'u3', followingId: 'u2' }, // Sneha follows Arjun
  ])

  // Modals Global State
  const [activeUserProfileId, setActiveUserProfileId] = useState(null)
  const [activeFollowersModal, setActiveFollowersModal] = useState(null) // { userId, tab: 'followers' | 'following' }

  const openFollowersModal = useCallback((userId, tab = 'followers') => {
    setActiveFollowersModal({ userId, tab })
  }, [])

  const closeFollowersModal = useCallback(() => {
    setActiveFollowersModal(null)
  }, [])

  const openUserProfile = useCallback((userId) => {
    setActiveUserProfileId(userId)
  }, [])

  const closeUserProfile = useCallback(() => {
    setActiveUserProfileId(null)
  }, [])

  // Follow handlers
  const getFollowers = useCallback((userId) => {
    const followerIds = followRelations
      .filter((r) => r.followingId === userId)
      .map((r) => r.followerId)
    return allUsers.filter((u) => followerIds.includes(u.id))
  }, [followRelations, allUsers])

  const getFollowing = useCallback((userId) => {
    const followingIds = followRelations
      .filter((r) => r.followerId === userId)
      .map((r) => r.followingId)
    return allUsers.filter((u) => followingIds.includes(u.id))
  }, [followRelations, allUsers])

  const isFollowing = useCallback((followerId, followingId) => {
    return followRelations.some((r) => r.followerId === followerId && r.followingId === followingId)
  }, [followRelations])

  const followUser = useCallback((followerId, followingId) => {
    setFollowRelations((prev) => {
      if (prev.some((r) => r.followerId === followerId && r.followingId === followingId)) return prev
      return [...prev, { followerId, followingId }]
    })
  }, [])

  const unfollowUser = useCallback((followerId, followingId) => {
    setFollowRelations((prev) =>
      prev.filter((r) => !(r.followerId === followerId && r.followingId === followingId))
    )
  }, [])

  const removeFollower = useCallback((userId, followerId) => {
    // remove followerId from following userId
    setFollowRelations((prev) =>
      prev.filter((r) => !(r.followerId === followerId && r.followingId === userId))
    )
  }, [])

  const login = useCallback((email) => {
    const found = allUsers.find((u) => u.email === email) || allUsers[0]
    setUser(found)
  }, [allUsers])

  const logout = useCallback(() => setUser(null), [])

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = {
        ...(prev || allUsers[0]),
        ...updates,
      }
      // Keep allUsers in sync with user profile edits
      setAllUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === updated.id ? updated : u))
      )
      return updated
    })
  }, [allUsers])

  const signup = useCallback((name, email) => {
    const newUser = {
      id: `u${Date.now()}`,
      name: name || 'New User',
      username: (name || 'newuser').toLowerCase().replace(/\s+/g, ''),
      email: email || 'user@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      bio: 'New storyteller on the block! ✨',
    }
    setAllUsers((prev) => [...prev, newUser])
    setUser(newUser)
  }, [])

  const addBook = useCallback((book) => {
    const newBook = {
      ...book,
      id: `b${Date.now()}`,
      memoryCount: 0,
      ownerId: user?.id || 'u1',
      collaboratorIds: [user?.id || 'u1'],
      createdAt: new Date().toISOString().split('T')[0],
    }
    setBooks((prev) => [newBook, ...prev])
    return newBook
  }, [user])

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

  const updateMemory = useCallback((memoryId, updates) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === memoryId ? { ...m, ...updates } : m))
    )
  }, [])

  const deleteMemory = useCallback((memoryId, bookId) => {
    setMemories((prev) => prev.filter((m) => m.id !== memoryId))
    if (bookId) {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId ? { ...b, memoryCount: Math.max(0, b.memoryCount - 1) } : b
        )
      )
    }
  }, [])

  const getBookMemories = useCallback(
    (bookId) => memories.filter((m) => m.bookId === bookId),
    [memories]
  )

  const updateBook = useCallback((bookId, updates) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, ...updates } : b))
    )
  }, [])

  const deleteBook = useCallback((bookId) => {
    setBooks((prev) => prev.filter((b) => b.id !== bookId))
  }, [])

  return (
    <AppContext.Provider
      value={{
        allUsers,
        user,
        login,
        logout,
        signup,
        updateUser,
        books,
        memories,
        addBook,
        addMemory,
        updateMemory,
        deleteMemory,
        getBookMemories,
        updateBook,
        deleteBook,
        followRelations,
        activeUserProfileId,
        activeFollowersModal,
        openFollowersModal,
        closeFollowersModal,
        openUserProfile,
        closeUserProfile,
        getFollowers,
        getFollowing,
        isFollowing,
        followUser,
        unfollowUser,
        removeFollower,
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
