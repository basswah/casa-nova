import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { z } from "https://esm.sh/zod@3"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

// Restrict CORS to the app's own origin(s) — never "*".
const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || ""
  // If no origins configured, deny all cross-origin requests.
  const allowOrigin = allowedOrigins.includes(origin) ? origin : ""
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, GET, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  }
}

// Safe error response — never leaks internal details.
function errorResponse(status: number, message: string, req: Request) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(req) },
  })
}

function jsonResponse(data: unknown, status: number, req: Request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(req) },
  })
}

// Map internal errors to safe HTTP status codes without leaking internals.
function toErrorResponse(err: unknown, req: Request) {
  const raw = err instanceof Error ? err.message : "Unexpected error"
  const message = raw.toLowerCase()
  let status = 400
  if (message.includes("unauthorized")) status = 401
  else if (message.includes("forbidden")) status = 403
  else if (message.includes("not found")) status = 404
  // Generic, non-leaking message for the client.
  const safe = status >= 500 ? "Internal server error" : "Request failed"
  return errorResponse(status, safe, req)
}

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
    return new Response(null, { headers: { ...corsHeaders(req) } })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) throw new Error("Unauthorized")

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

      return jsonResponse(result, 200, req)
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

      return jsonResponse({ id: authData.user.id, email: authData.user.email }, 201, req)
    }

    if (req.method === "PATCH" && action === "update-user") {
      const body = await req.json()
      const parsed = updateUserSchema.safeParse(body)
      if (!parsed.success) throw new Error(parsed.error.errors[0].message)

      const { id, email, password, displayName, role, isActive } = parsed.data

      // Prevent admin from modifying themselves (self-lockout protection).
      if (id === caller.id) {
        if (isActive === false) {
          throw new Error("Forbidden: cannot disable yourself")
        }
        if (role && role !== "admin") {
          throw new Error("Forbidden: cannot change your own role")
        }
      }

      // Prevent disabling or downgrading another admin.
      if (id !== caller.id) {
        const targetProfile = await getUserProfile(id)
        if (targetProfile?.role === "admin") {
          if (isActive === false) {
            throw new Error("Forbidden: cannot disable another admin")
          }
          if (role && role !== "admin") {
            throw new Error("Forbidden: cannot downgrade another admin")
          }
        }
      }

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

      return jsonResponse({ success: true }, 200, req)
    }

    throw new Error("Not found")
  } catch (err) {
    return toErrorResponse(err, req)
  }
})
