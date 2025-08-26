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

    // Get user's job descriptions
    const { data: jobs, error } = await supabase
      .from("job_descriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      // Handle missing table error
      if (error.message?.includes("Could not find the table")) {
        return NextResponse.json(
          {
            error: "Database not initialized. Please run the database setup scripts first.",
            setupRequired: true,
            jobs: [],
          },
          { status: 200 },
        )
      }
      throw error
    }

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Get jobs error:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!jobData.title || !jobData.description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    // Create job description
    const { data: job, error } = await supabase
      .from("job_descriptions")
      .insert({
        user_id: user.id,
        title: jobData.title,
        company: jobData.company || "",
        location: jobData.location || "",
        job_type: jobData.jobType || "full-time",
        experience_level: jobData.experienceLevel || "mid",
        salary_range: jobData.salaryRange || null,
        description: jobData.description,
        requirements: jobData.requirements || [],
        benefits: jobData.benefits || [],
        skills_required: jobData.skillsRequired || [],
        status: "active",
      })
      .select()
      .single()

    if (error) {
      // Handle missing table error
      if (error.message?.includes("Could not find the table")) {
        return NextResponse.json(
          {
            error: "Database not initialized. Please run the database setup scripts first.",
            setupRequired: true,
          },
          { status: 200 },
        )
      }
      throw error
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error("Create job error:", error)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
