"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Product, User } from "@/lib/supabase"

interface ProductSearchProps {
  onResults: (products: (Product & { owner: User })[]) => void
  isVIP?: boolean
}

export function ProductSearch({ onResults, isVIP = false }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const searchProducts = async () => {
      if (!searchTerm.trim()) {
        // Load all products when search is empty
        loadAllProducts()
        return
      }

      setIsSearching(true)
      try {
        const { data, error } = await supabase
          .from("products")
          .select(
            `
            *,
            owner:users(*)
          `,
          )
          .eq("is_active", true)
          .ilike("name", `%${searchTerm}%`)
          .order("created_at", { ascending: false })

        if (error) throw error
        onResults(data || [])
      } catch (error) {
        console.error("Search error:", error)
        onResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const loadAllProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(
            `
            *,
            owner:users(*)
          `,
          )
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        if (error) throw error
        onResults(data || [])
      } catch (error) {
        console.error("Load products error:", error)
        onResults([])
      }
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, onResults])

  return (
    <div className="relative">
      <Search
        className={`absolute left-3 top-3 w-4 h-4 ${isVIP ? "text-purple-300" : "text-gray-400"} ${isSearching ? "animate-pulse" : ""}`}
      />
      <Input
        placeholder="Search products by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`pl-10 ${isVIP ? "bg-purple-900/50 border-purple-600 text-white placeholder-purple-300" : "bg-white/90 border-gray-200"} rounded-xl backdrop-blur-sm`}
      />
    </div>
  )
}
