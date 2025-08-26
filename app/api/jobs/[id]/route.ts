import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get job with match results
    const { data: job, error } = await supabase
      .from("job_descriptions")
      .select(`
        *,
        resume_matches (
          id,
          match_score,
          match_details,
          created_at,
          parsed_resumes (
            id,
            parsed_data,
            profiles (
              full_name,
              email
            )
          )
        )
      `)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (error || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error("Get job error:", error)
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const jobData = await request.json()

    // Update job description
    const { data: job, error } = await supabase
      .from("job_descriptions")
      .update({
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        job_type: jobData.jobType,
        experience_level: jobData.experienceLevel,
        salary_range: jobData.salaryRange,
        description: jobData.description,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        skills_required: jobData.skillsRequired,
        status: jobData.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error || !job) {
      return NextResponse.json({ error: "Job not found or update failed" }, { status: 404 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error("Update job error:", error)
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Delete job and related matches
    const { error } = await supabase.from("job_descriptions").delete().eq("id", params.id).eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: "Failed to delete job" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete job error:", error)
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 })
  }
}
