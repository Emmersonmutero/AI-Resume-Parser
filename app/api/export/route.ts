import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { hasPermission } from "@/lib/permissions"

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

    const canReadCandidates = await hasPermission(user.id, "candidates:read")
    if (!canReadCandidates) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { type, candidateIds } = await request.json()

    if (type === "candidates") {
      // Export candidate data
      let query = supabase.from("parsed_resumes").select(`
          id,
          parsed_data,
          parsing_confidence,
          created_at,
          profiles!inner(full_name, email, role)
        `)

      if (candidateIds && candidateIds.length > 0) {
        query = query.in("id", candidateIds)
      }

      const { data: candidates, error } = await query.order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      // Format data for export
      const exportData =
        candidates?.map((candidate) => ({
          id: candidate.id,
          name: candidate.profiles?.full_name || "N/A",
          email: candidate.profiles?.email || "N/A",
          phone: candidate.parsed_data?.personalInfo?.phone || "N/A",
          location: candidate.parsed_data?.personalInfo?.location || "N/A",
          summary: candidate.parsed_data?.summary || "N/A",
          experience:
            candidate.parsed_data?.experience
              ?.map((exp: any) => `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate || "Present"})`)
              .join("; ") || "N/A",
          education:
            candidate.parsed_data?.education
              ?.map((edu: any) => `${edu.degree} from ${edu.institution} (${edu.graduationDate})`)
              .join("; ") || "N/A",
          skills:
            [...(candidate.parsed_data?.skills?.technical || []), ...(candidate.parsed_data?.skills?.soft || [])].join(
              ", ",
            ) || "N/A",
          confidence: candidate.parsing_confidence,
          uploadedAt: candidate.created_at,
        })) || []

      return NextResponse.json({
        data: exportData,
        filename: `candidates_export_${new Date().toISOString().split("T")[0]}.json`,
      })
    }

    return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
