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

    // Get analytics data
    const [resumesResult, jobsResult, matchesResult, searchesResult] = await Promise.all([
      supabase.from("resumes").select("id, created_at").eq("user_id", user.id),
      supabase.from("job_descriptions").select("id, created_at").eq("user_id", user.id),
      supabase.from("resume_matches").select("id, match_score, created_at").eq("user_id", user.id),
      supabase.from("search_logs").select("id, search_timestamp").eq("user_id", user.id),
    ])

    // Calculate metrics
    const totalResumes = resumesResult.data?.length || 0
    const totalJobs = jobsResult.data?.length || 0
    const totalMatches = matchesResult.data?.length || 0
    const totalSearches = searchesResult.data?.length || 0

    // Calculate average match score
    const avgMatchScore =
      matchesResult.data?.length > 0
        ? matchesResult.data.reduce((sum, match) => sum + match.match_score, 0) / matchesResult.data.length
        : 0

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentResumes = resumesResult.data?.filter((r) => new Date(r.created_at) > thirtyDaysAgo).length || 0

    const recentJobs = jobsResult.data?.filter((j) => new Date(j.created_at) > thirtyDaysAgo).length || 0

    return NextResponse.json({
      overview: {
        totalResumes,
        totalJobs,
        totalMatches,
        totalSearches,
        avgMatchScore: Math.round(avgMatchScore),
        recentResumes,
        recentJobs,
      },
      timeline: {
        resumes:
          resumesResult.data?.map((r) => ({
            date: r.created_at.split("T")[0],
            count: 1,
          })) || [],
        jobs:
          jobsResult.data?.map((j) => ({
            date: j.created_at.split("T")[0],
            count: 1,
          })) || [],
        matches:
          matchesResult.data?.map((m) => ({
            date: m.created_at.split("T")[0],
            score: m.match_score,
          })) || [],
      },
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
