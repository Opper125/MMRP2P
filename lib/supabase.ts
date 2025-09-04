import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://apkwrsrbhwujnjogwrci.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwa3dyc3JiaHd1am5qb2d3cmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTYxODAsImV4cCI6MjA3MjMzMjE4MH0.T0-WlO8GCcOeGSuIMbirfDwbm3tQyb2VcFjWbJ5BDm8"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  name: string
  username: string
  email: string
  password: string
  role: "users" | "admin" | "VIP"
  profile_image_url?: string
  is_banned: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  target_number: string
  owner_id: string
  name: string
  description: string
  price: number
  icon_url?: string
  images: string[]
  video_url?: string
  contact_platform: string
  contact_info: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  product_id: string
  buyer_id: string
  seller_id: string
  payment_method_id?: string
  payment_proof_url?: string
  status: "pending" | "approved" | "rejected"
  total_amount: number
  created_at: string
  updated_at: string
}

export interface PaymentMethod {
  id: string
  user_id: string
  payment_name: string
  address: string
  payment_icon_url?: string
  description: string
  qr_code_url?: string
  is_active: boolean
  created_at: string
}

export interface News {
  id: string
  author_id: string
  title: string
  content: string
  images: string[]
  video_url?: string
  product_links: string[]
  social_links: { platform: string; url: string; icon: string }[]
  is_active: boolean
  created_at: string
  updated_at: string
}
