import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch interviews with related data
    const { data: interviews, error } = await supabase
      .from("interviews")
      .select(`
        *,
        applications!inner(
          candidate_id,
          job_descriptions!inner(
            title,
            company
          )
        ),
        candidate:candidate_id(
          profiles!inner(
            first_name,
            last_name
          )
        )
      `)
      .eq("interviewer_id", user.id)
      .order("scheduled_at", { ascending: true })

    if (error) {
      // Handle case where tables don't exist yet
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json({
          interviews: [],
          message: "Database setup required. Please run the database initialization scripts.",
          setupRequired: true,
        })
      }
      throw error
    }

    // Transform the data for frontend consumption
    const transformedInterviews =
      interviews?.map((interview) => ({
        id: interview.id,
        application_id: interview.application_id,
        candidate_name: interview.candidate?.profiles?.[0]
          ? `${interview.candidate.profiles[0].first_name} ${interview.candidate.profiles[0].last_name}`
          : "Unknown Candidate",
        job_title: interview.applications?.job_descriptions?.title || "Unknown Position",
        scheduled_at: interview.scheduled_at,
        duration_minutes: interview.duration_minutes,
        interview_type: interview.interview_type,
        meeting_link: interview.meeting_link,
        location: interview.location,
        status: interview.status,
        rating: interview.rating,
        interviewer_notes: interview.interviewer_notes,
      })) || []

    return NextResponse.json({
      interviews: transformedInterviews,
      total: transformedInterviews.length,
    })
  } catch (error) {
    console.error("Error fetching interviews:", error)
    return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      application_id,
      candidate_id,
      scheduled_at,
      duration_minutes = 60,
      interview_type = "video",
      meeting_link,
      location,
    } = body

    // Validate required fields
    if (!application_id || !candidate_id || !scheduled_at) {
      return NextResponse.json(
        { error: "Missing required fields: application_id, candidate_id, scheduled_at" },
        { status: 400 },
      )
    }

    // Create interview
    const { data: interview, error } = await supabase
      .from("interviews")
      .insert({
        application_id,
        interviewer_id: user.id,
        candidate_id,
        scheduled_at,
        duration_minutes,
        interview_type,
        meeting_link,
        location,
      })
      .select()
      .single()

    if (error) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json(
          {
            error: "Database setup required. Please run the database initialization scripts.",
            setupRequired: true,
          },
          { status: 400 },
        )
      }
      throw error
    }

    return NextResponse.json({
      interview,
      message: "Interview scheduled successfully",
    })
  } catch (error) {
    console.error("Error creating interview:", error)
    return NextResponse.json({ error: "Failed to schedule interview" }, { status: 500 })
  }
}
