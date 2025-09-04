import { supabase } from "./supabase"
import type { User } from "./supabase"

export interface AuthUser extends User {
  session?: any
}

// Custom authentication (not using Supabase Auth)
export const authService = {
  async signUp(userData: {
    name: string
    username: string
    email: string
    password: string
  }) {
    // Check if username or email already exists
    const { data: existingUsers } = await supabase
      .from("users")
      .select("username, email")
      .or(`username.eq.${userData.username},email.eq.${userData.email}`)

    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0]
      if (existingUser.username === userData.username) {
        throw new Error("Username already exists")
      }
      if (existingUser.email === userData.email) {
        throw new Error("Email already exists")
      }
    }

    // Insert new user (password stored as plain text as requested)
    const { data, error } = await supabase.from("users").insert([userData]).select().single()

    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .eq("is_banned", false)
      .single()

    if (error || !data) {
      throw new Error("Invalid email or password")
    }

    // Store session in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(data))
    }

    return data
  },

  async signOut() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user")
    }
  },

  getCurrentUser(): AuthUser | null {
    if (typeof window === "undefined") return null

    const stored = localStorage.getItem("auth_user")
    if (!stored) return null

    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  },

  async trackUserSession(user: User, deviceInfo: any) {
    // Get user's location and device info
    const sessionData = {
      user_id: user.id,
      ip_address: await this.getClientIP(),
      device_info: deviceInfo,
      platform_name: navigator.platform,
      location: await this.getCurrentLocation(),
    }

    const { error } = await supabase.from("user_sessions").insert([sessionData])

    if (error) console.error("Session tracking error:", error)
  },

  async getClientIP() {
    try {
      const response = await fetch("https://api.ipify.org?format=json")
      const data = await response.json()
      return data.ip
    } catch {
      return null
    }
  },

  async getCurrentLocation(): Promise<any> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        },
        () => resolve(null),
        { timeout: 10000 },
      )
    })
  },
}
