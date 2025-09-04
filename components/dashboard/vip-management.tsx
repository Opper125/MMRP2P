"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Crown, Shield, Ban, CheckCircle, Settings } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { User as SupaUser } from "@/lib/supabase"

interface VIPManagementProps {
  currentUser: SupaUser
}

export function VIPManagement({ currentUser }: VIPManagementProps) {
  const [users, setUsers] = useState<SupaUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: "users" | "admin" | "VIP") => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", userId)

      if (error) throw error

      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    } catch (error) {
      console.error("Error updating user role:", error)
    }
  }

  const toggleUserBan = async (userId: string, isBanned: boolean) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_banned: !isBanned, updated_at: new Date().toISOString() })
        .eq("id", userId)

      if (error) throw error

      setUsers(users.map((user) => (user.id === userId ? { ...user, is_banned: !isBanned } : user)))
    } catch (error) {
      console.error("Error updating user ban status:", error)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "VIP":
        return <Crown className="w-4 h-4 text-yellow-400" />
      case "admin":
        return <Shield className="w-4 h-4 text-green-500" />
      default:
        return <Ban className="w-4 h-4 text-blue-500" />
    }
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      VIP: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
      admin: "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
      users: "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
    }
    return variants[role as keyof typeof variants] || variants.users
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-2xl">
              <Settings className="w-6 h-6" />
              VIP Management Panel
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Search */}
        <Card className="bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-purple-300" />
              <Input
                placeholder="Search users by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-purple-900/50 border-purple-600 text-white placeholder-purple-300 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card className="bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600">
              <CardContent className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-purple-200">Loading users...</p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card
                key={user.id}
                className="bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600 backdrop-blur-sm"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border-2 border-purple-400">
                        <AvatarImage src={user.profile_image_url || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-purple-600 text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{user.name}</h3>
                          {getRoleIcon(user.role)}
                          {user.is_banned && <Ban className="w-4 h-4 text-red-400" />}
                        </div>
                        <p className="text-purple-200 text-sm">@{user.username}</p>
                        <p className="text-purple-300 text-xs">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getRoleBadge(user.role)}>{user.role.toUpperCase()}</Badge>

                      {user.id !== currentUser.id && (
                        <div className="flex gap-2">
                          {/* Role Management */}
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                            className="bg-purple-900/50 border border-purple-600 text-white text-sm rounded-lg px-2 py-1"
                          >
                            <option value="users">User</option>
                            <option value="admin">Admin</option>
                            <option value="VIP">VIP</option>
                          </select>

                          {/* Ban/Unban */}
                          <Button
                            onClick={() => toggleUserBan(user.id, user.is_banned)}
                            size="sm"
                            variant={user.is_banned ? "default" : "destructive"}
                            className={
                              user.is_banned
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }
                          >
                            {user.is_banned ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Unban
                              </>
                            ) : (
                              <>
                                <Ban className="w-3 h-3 mr-1" />
                                Ban
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
