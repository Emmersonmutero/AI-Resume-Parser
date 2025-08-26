import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
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

    // Get user profile
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (error) {
      // Handle missing table error
      if (error.message?.includes("Could not find the table")) {
        return NextResponse.json(
          {
            error: "Database not initialized. Please run the database setup scripts first.",
            setupRequired: true,
            profile: null,
          },
          { status: 200 },
        )
      }
      throw error
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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

    const profileData = await request.json()

    // Update user profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        full_name: profileData.fullName,
        company: profileData.company,
        role: profileData.role,
        phone: profileData.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
