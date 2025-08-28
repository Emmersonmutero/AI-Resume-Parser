import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { hasPermission } from "@/lib/permissions"

interface SearchFilters {
  query: string
  skills: string[]
  location: string
  experienceLevel: string
  educationLevel: string
  experienceYears: number[]
  companies: string[]
  jobTitles: string[]
  industries: string[]
  availability: string
  salaryRange: number[]
}

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

    const canReadCandidates = await hasPermission(user.id, "candidates:read")
    if (!canReadCandidates) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const filters: SearchFilters = await request.json()

    // Build the search query
    let query = supabase.from("parsed_resumes").select(`
      id,
      user_id,
      parsed_data,
      parsing_confidence,
      created_at,
      profiles!inner(full_name, email, role)
    `)

    // Apply text search if query provided
    if (filters.query) {
      // This is a simplified search - in production you'd want full-text search
      query = query.or(
        `parsed_data->>personalInfo->>fullName.ilike.%${filters.query}%,` +
          `parsed_data->>summary.ilike.%${filters.query}%,` +
          `parsed_data->>experience.cs.[{"position":"${filters.query}"}],` +
          `parsed_data->>experience.cs.[{"company":"${filters.query}"}]`,
      )
    }

    // Apply location filter
    if (filters.location) {
      query = query.ilike("parsed_data->>personalInfo->>location", `%${filters.location}%`)
    }

    // Execute the query
    const { data: results, error } = await query.order("created_at", { ascending: false }).limit(100)

    if (error) {
      throw error
    }

    // Apply client-side filtering for complex filters
    let filteredResults = results || []

    // Filter by skills
    if (filters.skills.length > 0) {
      filteredResults = filteredResults.filter((candidate) => {
        const candidateSkills = [
          ...(candidate.parsed_data.skills?.technical || []),
          ...(candidate.parsed_data.skills?.soft || []),
        ].map((skill) => skill.toLowerCase())

        return filters.skills.some((requiredSkill) =>
          candidateSkills.some((candidateSkill) => candidateSkill.includes(requiredSkill.toLowerCase())),
        )
      })
    }

    // Filter by experience level
    if (filters.experienceLevel) {
      filteredResults = filteredResults.filter((candidate) => {
        const experience = candidate.parsed_data.experience || []
        const totalYears = calculateExperienceYears(experience)

        switch (filters.experienceLevel) {
          case "entry":
            return totalYears <= 2
          case "mid":
            return totalYears >= 3 && totalYears <= 5
          case "senior":
            return totalYears >= 6 && totalYears <= 10
          case "lead":
            return totalYears >= 10
          case "executive":
            return totalYears >= 15
          default:
            return true
        }
      })
    }

    // Filter by education level
    if (filters.educationLevel) {
      filteredResults = filteredResults.filter((candidate) => {
        const education = candidate.parsed_data.education || []
        return education.some((edu) => {
          const degree = edu.degree.toLowerCase()
          switch (filters.educationLevel) {
            case "high-school":
              return degree.includes("high school") || degree.includes("diploma")
            case "associate":
              return degree.includes("associate")
            case "bachelor":
              return degree.includes("bachelor") || degree.includes("bs") || degree.includes("ba")
            case "master":
              return (
                degree.includes("master") || degree.includes("ms") || degree.includes("ma") || degree.includes("mba")
              )
            case "phd":
              return degree.includes("phd") || degree.includes("doctorate") || degree.includes("ph.d")
            default:
              return true
          }
        })
      })
    }

    // Log search results count
    if (filters.query) {
      await supabase
        .from("search_logs")
        .update({ results_count: filteredResults.length })
        .eq("user_id", user.id)
        .eq("search_query", filters.query)
        .order("search_timestamp", { ascending: false })
        .limit(1)
    }

    return NextResponse.json({
      results: filteredResults,
      totalCount: filteredResults.length,
      filters: filters,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}

function calculateExperienceYears(experience: any[]): number {
  if (!experience || experience.length === 0) return 0

  let totalMonths = 0
  const currentDate = new Date()

  experience.forEach((exp) => {
    const startDate = new Date(exp.startDate)
    const endDate = exp.endDate ? new Date(exp.endDate) : currentDate

    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
    totalMonths += Math.max(0, months)
  })

  return Math.round(totalMonths / 12)
}
