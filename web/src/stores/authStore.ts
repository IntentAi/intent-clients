/**
 * Authentication store.
 * Manages JWT token and current user session.
 */

import { create } from 'zustand'
import type { CurrentUser } from '../types/user'
import * as authApi from '../api/auth'

interface AuthState {
  token: string | null
  user: CurrentUser | null
  isAuthenticated: boolean
  isLoading: boolean

  login: (usernameOrEmail: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  setToken: (token: string | null) => void
  setUser: (user: CurrentUser | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (usernameOrEmail: string, password: string) => {
    set({ isLoading: true })
    try {
      const response = await authApi.login(usernameOrEmail, password)
      set({
        token: response.token,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true })
    try {
      const response = await authApi.register(username, email, password)
      set({
        token: response.token,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: () => {
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    })
  },

  setToken: (token: string | null) => {
    set({ token, isAuthenticated: !!token })
  },

  setUser: (user: CurrentUser | null) => {
    set({ user })
  },
}))
