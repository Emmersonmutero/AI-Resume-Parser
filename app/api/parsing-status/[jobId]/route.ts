import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { hasPermission } from "@/lib/permissions"

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const supabase = createServerClient()

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

    const { data: job, error } = await supabase
      .from("parsing_jobs")
      .select(`
        *,
        resumes (
          filename,
          file_size
        ),
        parsed_resumes (
          parsed_data,
          parsing_confidence
        )
      `)
      .eq("id", params.jobId)
      .eq("user_id", user.id)
      .single()

    if (error || !job) {
      return NextResponse.json({ error: "Parsing job not found" }, { status: 404 })
    }

    return NextResponse.json({
      job: {
        id: job.id,
        status: job.status,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        errorMessage: job.error_message,
        resume: job.resumes,
        parsedData: job.parsed_resumes?.[0]?.parsed_data,
        confidence: job.parsed_resumes?.[0]?.parsing_confidence,
      },
    })
  } catch (error) {
    console.error("Get parsing status error:", error)
    return NextResponse.json({ error: "Failed to get parsing status" }, { status: 500 })
  }
}
