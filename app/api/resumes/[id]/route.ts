import { del } from "@vercel/blob"
import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { hasPermission } from "@/lib/permissions"

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

    const canDeleteCandidates = await hasPermission(user.id, "candidates:delete")
    if (!canDeleteCandidates) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const resumeId = params.id

    // Get resume record
    const { data: resume, error: fetchError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    // Delete from Vercel Blob
    await del(resume.file_path)

    // Delete from database
    const { error: deleteError } = await supabase.from("resumes").delete().eq("id", resumeId).eq("user_id", user.id)

    if (deleteError) {
      console.error("Database delete error:", deleteError)
      return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
