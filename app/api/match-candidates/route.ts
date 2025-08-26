import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { matchCandidateToJob } from "@/lib/job-matcher"

export async function POST(request: NextRequest) {
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

    const { jobId } = await request.json()

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    // Get job description
    const { data: job, error: jobError } = await supabase
      .from("job_descriptions")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Get all parsed resumes
    const { data: candidates, error: candidatesError } = await supabase
      .from("parsed_resumes")
      .select("*")
      .order("created_at", { ascending: false })

    if (candidatesError) {
      throw candidatesError
    }

    // Clear existing matches for this job
    await supabase.from("resume_matches").delete().eq("job_id", jobId)

    const matches = []

    // Process candidates in batches to avoid rate limits
    for (const candidate of candidates || []) {
      try {
        console.log(`[v0] Matching candidate ${candidate.id} to job ${jobId}`)

        const matchResult = await matchCandidateToJob(candidate.parsed_data, job)

        // Store the match result
        const { error: matchError } = await supabase.from("resume_matches").insert({
          job_id: jobId,
          resume_id: candidate.id,
          user_id: user.id,
          match_score: matchResult.overallScore,
          match_details: matchResult,
        })

        if (matchError) {
          console.error("Error storing match:", matchError)
        } else {
          matches.push({
            candidateId: candidate.id,
            score: matchResult.overallScore,
            details: matchResult,
          })
        }

        // Small delay to avoid overwhelming the API
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error matching candidate ${candidate.id}:`, error)
        // Continue with other candidates
      }
    }

    return NextResponse.json({
      message: "Candidate matching completed",
      jobId,
      totalCandidates: candidates?.length || 0,
      matchesCreated: matches.length,
      matches: matches.slice(0, 10), // Return top 10 matches
    })
  } catch (error) {
    console.error("Match candidates error:", error)
    return NextResponse.json({ error: "Failed to match candidates" }, { status: 500 })
  }
}
