import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { hasPermission } from "@/lib/permissions"
import { groq } from "@ai-sdk/groq"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const canReadCandidates = await hasPermission(user.id, "candidates:read")
    if (!canReadCandidates) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { type, content, jobDescription, company, position } = await request.json()

    let prompt = ""
    let systemMessage = ""

    switch (type) {
      case "optimize":
        systemMessage =
          "You are an expert resume writer and career coach. Help optimize resumes for better job matching and ATS compatibility."
        prompt = `Please optimize this resume content for the target job description:

Resume Content:
${content}

Target Job Description:
${jobDescription}

Please provide:
1. Optimized resume content with improved formatting and keywords
2. Key improvements made
3. ATS compatibility score (1-100)
4. Specific recommendations for better job matching`
        break

      case "cover-letter":
        systemMessage =
          "You are an expert cover letter writer. Create compelling, personalized cover letters that highlight relevant experience."
        prompt = `Create a professional cover letter for this application:

Company: ${company}
Position: ${position}
Job Requirements: ${content}

Based on the user's background, create a compelling cover letter that:
1. Shows enthusiasm for the role and company
2. Highlights relevant skills and experience
3. Demonstrates knowledge of the company/role
4. Has a strong opening and closing
5. Is concise but impactful (3-4 paragraphs)`
        break

      case "keywords":
        systemMessage =
          "You are an ATS and keyword optimization expert. Analyze job descriptions and provide keyword recommendations."
        prompt = `Analyze this job description and provide keyword optimization recommendations:

Job Description:
${content}

Please provide:
1. Top 15-20 keywords/phrases that should be included in a resume
2. Industry-specific terms and technologies
3. Soft skills mentioned
4. Required qualifications keywords
5. Action verbs that would be effective
6. ATS optimization tips for this specific role`
        break

      case "analysis":
        systemMessage = "You are a resume analysis expert. Provide detailed feedback and scoring on resume quality."
        prompt = `Analyze this resume and provide comprehensive feedback:

Resume Content:
${content}

Please provide:
1. Overall score (1-100) with breakdown by category:
   - Content Quality (25 points)
   - ATS Compatibility (25 points)
   - Formatting & Structure (25 points)
   - Keyword Optimization (25 points)
2. Strengths of the resume
3. Areas for improvement
4. Specific recommendations
5. Industry best practices this resume follows or misses`
        break

      default:
        return NextResponse.json({ error: "Invalid request type" }, { status: 400 })
    }

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      system: systemMessage,
      prompt: prompt,
      maxTokens: 2000,
    })

    return NextResponse.json({
      success: true,
      result: text,
      type: type,
    })
  } catch (error) {
    console.error("AI Assistant error:", error)
    return NextResponse.json({ error: "Failed to process AI request" }, { status: 500 })
  }
}
