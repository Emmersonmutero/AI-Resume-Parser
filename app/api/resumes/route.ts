import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { hasPermission } from "@/lib/permissions"

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const canReadCandidates = await hasPermission(user.id, "candidates:read")
    if (!canReadCandidates) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get user's resumes
    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 })
    }

    return NextResponse.json({ resumes })
  } catch (error) {
    console.error("Error fetching resumes:", error)
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 })
  }
}
