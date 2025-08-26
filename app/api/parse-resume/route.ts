import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { parseResumeText, extractTextFromFile } from "@/lib/resume-parser"
import { get } from "@vercel/blob"

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

    const { resumeId } = await request.json()

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 })
    }

    // Get resume record from database
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single()

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    // Check if already parsed
    const { data: existingParsed } = await supabase
      .from("parsed_resumes")
      .select("*")
      .eq("resume_id", resumeId)
      .single()

    if (existingParsed) {
      return NextResponse.json({
        message: "Resume already parsed",
        parsedData: existingParsed.parsed_data,
      })
    }

    // Create parsing job record
    const { data: parsingJob, error: jobError } = await supabase
      .from("parsing_jobs")
      .insert({
        resume_id: resumeId,
        user_id: user.id,
        status: "processing",
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (jobError) {
      return NextResponse.json({ error: "Failed to create parsing job" }, { status: 500 })
    }

    try {
      // Download file from blob storage
      const blob = await get(resume.file_url)
      const file = new File([await blob.arrayBuffer()], resume.filename, {
        type: resume.file_type,
      })

      // Extract text from file
      const resumeText = await extractTextFromFile(file)

      // Parse resume using AI
      const parsedData = await parseResumeText(resumeText)

      // Store parsed data
      const { error: insertError } = await supabase.from("parsed_resumes").insert({
        resume_id: resumeId,
        user_id: user.id,
        parsed_data: parsedData,
        raw_text: resumeText,
        parsing_confidence: 0.95, // You could implement confidence scoring
      })

      if (insertError) {
        throw new Error("Failed to store parsed data")
      }

      // Update parsing job status
      await supabase
        .from("parsing_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", parsingJob.id)

      return NextResponse.json({
        message: "Resume parsed successfully",
        parsedData,
        jobId: parsingJob.id,
      })
    } catch (parseError) {
      // Update parsing job with error
      await supabase
        .from("parsing_jobs")
        .update({
          status: "failed",
          error_message: parseError instanceof Error ? parseError.message : "Unknown error",
          completed_at: new Date().toISOString(),
        })
        .eq("id", parsingJob.id)

      throw parseError
    }
  } catch (error) {
    console.error("Parse resume error:", error)
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 })
  }
}
