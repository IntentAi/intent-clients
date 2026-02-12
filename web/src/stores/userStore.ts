/**
 * User store.
 * Caches user profiles to prevent redundant API calls.
 * Keyed by user ID for O(1) lookups.
 */

import { create } from 'zustand'
import type { User } from '../types/user'

interface UserState {
  users: Record<string, User>

  addUser: (user: User) => void
  addUsers: (users: User[]) => void
  getUser: (userId: string) => User | undefined
  hasUser: (userId: string) => boolean
}

export const useUserStore = create<UserState>((set, get) => ({
  users: {},

  addUser: (user: User) => {
    set((state) => ({
      users: { ...state.users, [user.id]: user },
    }))
  },

  addUsers: (users: User[]) => {
    set((state) => {
      const newUsers = users.reduce(
        (acc, user) => {
          acc[user.id] = user
          return acc
        },
        {} as Record<string, User>,
      )
      return {
        users: { ...state.users, ...newUsers },
      }
    })
  },

  getUser: (userId: string) => {
    return get().users[userId]
  },

  hasUser: (userId: string) => {
    return userId in get().users
  },
}))
