import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { z } from "https://esm.sh/zod@3"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const supabase = createClient(supabaseUrl, serviceRoleKey)

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(1),
  role: z.enum(["admin", "manager", "cashier"]),
})

const updateUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  displayName: z.string().min(1).optional(),
  role: z.enum(["admin", "manager", "cashier"]).optional(),
  isActive: z.boolean().optional(),
})

async function getUserProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
  return data
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) throw new Error("Missing authorization header")

    const token = authHeader.replace("Bearer ", "")
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !caller) throw new Error("Unauthorized")

    const profile = await getUserProfile(caller.id)
    if (!profile || profile.role !== "admin") throw new Error("Forbidden: admin only")

    const url = new URL(req.url)
    const action = url.pathname.split("/").pop()

    if (req.method === "GET" && action === "users") {
      const { data: users } = await supabase.auth.admin.listUsers()
      const { data: profiles } = await supabase.from("profiles").select("*")

      const profileMap = new Map((profiles || []).map((p: { id: string }) => [p.id, p]))

      const result = (users?.users || []).map((u: {
        id: string;
        email?: string;
        created_at?: string;
        last_sign_in_at?: string;
      }) => ({
        id: u.id,
        email: u.email,
        createdAt: u.created_at,
        lastSignIn: u.last_sign_in_at,
        profile: profileMap.get(u.id) || null,
      }))

      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      })
    }

    if (req.method === "POST" && action === "create-user") {
      const body = await req.json()
      const parsed = createUserSchema.safeParse(body)
      if (!parsed.success) throw new Error(parsed.error.errors[0].message)

      const { email, password, displayName, role } = parsed.data

      const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName, role },
      })

      if (createError) throw new Error(createError.message)

      return new Response(JSON.stringify({ id: authData.user.id, email: authData.user.email }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        status: 201,
      })
    }

    if (req.method === "PATCH" && action === "update-user") {
      const body = await req.json()
      const parsed = updateUserSchema.safeParse(body)
      if (!parsed.success) throw new Error(parsed.error.errors[0].message)

      const { id, email, password, displayName, role, isActive } = parsed.data

      type AuthUpdate = { email?: string; password?: string }
      type ProfileUpdate = { display_name?: string; role?: string; is_active?: boolean; updated_at: string }

      const authUpdates: AuthUpdate = {}
      if (email) authUpdates.email = email
      if (password) authUpdates.password = password
      if (Object.keys(authUpdates).length > 0) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(id, authUpdates)
        if (updateError) throw new Error(updateError.message)
      }

      const profileUpdates: ProfileUpdate = { updated_at: new Date().toISOString() }
      if (displayName) profileUpdates.display_name = displayName
      if (role) profileUpdates.role = role
      if (isActive !== undefined) profileUpdates.is_active = isActive

      if (Object.keys(profileUpdates).length > 1) {
        const { error: profileError } = await supabase.from("profiles").update(profileUpdates).eq("id", id)
        if (profileError) throw new Error(profileError.message)
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      })
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    })
  }
})
