import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try to fetch applications, handle missing table gracefully
    try {
      const { data: applications, error } = await supabase
        .from("applications")
        .select(`
          *,
          job_descriptions (
            title,
            company,
            location,
            salary_range
          )
        `)
        .eq("candidate_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      return NextResponse.json({ applications })
    } catch (dbError: any) {
      if (dbError.message?.includes("does not exist") || dbError.message?.includes("schema cache")) {
        return NextResponse.json({
          applications: [],
          setupRequired: true,
          message: "Database tables not found. Please run the setup scripts first.",
        })
      }
      throw dbError
    }
  } catch (error) {
    console.error("Applications fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { jobId, resumeId, coverLetter } = await request.json()

    try {
      const { data: application, error } = await supabase
        .from("applications")
        .insert({
          candidate_id: user.id,
          job_id: jobId,
          resume_id: resumeId,
          cover_letter: coverLetter,
          status: "applied",
          applied_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        application,
      })
    } catch (dbError: any) {
      if (dbError.message?.includes("does not exist") || dbError.message?.includes("schema cache")) {
        return NextResponse.json(
          {
            error: "Database setup required",
            setupRequired: true,
            message: "Please run the database setup scripts first.",
          },
          { status: 400 },
        )
      }
      throw dbError
    }
  } catch (error) {
    console.error("Application creation error:", error)
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 })
  }
}
