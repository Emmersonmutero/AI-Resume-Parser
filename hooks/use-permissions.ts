import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

          if (profileError) throw profileError

          if (profile) {
            const { data: rolePermissions, error: permissionError } = await supabase
              .from("role_permissions")
              .select("permission")
              .eq("role", profile.role)

            if (permissionError) throw permissionError

            if (rolePermissions) {
              setPermissions(rolePermissions.map((p) => p.permission))
            }
          }
        }
      } catch (error) {
        console.error("Error fetching permissions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [supabase])

  return { permissions, loading }
}
