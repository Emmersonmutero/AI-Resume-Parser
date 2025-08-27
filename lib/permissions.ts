import { createServerClient } from "@/lib/supabase/server"

export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const supabase = await createServerClient()

  // Get user's role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    return false
  }

  // Check if the role has the required permission
  const { data: rolePermission, error: permissionError } = await supabase
    .from("role_permissions")
    .select("role")
    .eq("role", profile.role)
    .eq("permission", permission)
    .single()

  if (permissionError || !rolePermission) {
    return false
  }

  return true
}
