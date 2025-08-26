import { put } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only PDF, DOCX, and TXT files are allowed",
        },
        { status: 400 },
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "File too large. Maximum size is 10MB",
        },
        { status: 400 },
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const uniqueFilename = `resumes/${user.id}/${timestamp}_${sanitizedName}`

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, file, {
      access: "public",
    })

    // Save to database
    try {
      const { data: resume, error: dbError } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          filename: file.name,
          file_path: blob.url,
          file_size: file.size,
          file_type: file.type,
          status: "uploaded",
        })
        .select()
        .single()

      if (dbError) {
        // Check if it's a missing table error
        if (
          dbError.message?.includes("Could not find the table") ||
          (dbError.message?.includes("relation") && dbError.message?.includes("does not exist"))
        ) {
          return NextResponse.json(
            {
              error: "Database not initialized. Please run the database setup scripts first.",
              setupRequired: true,
              id: null,
              url: blob.url,
              filename: file.name,
              size: file.size,
              type: file.type,
              status: "uploaded_no_db",
            },
            { status: 200 },
          )
        }

        console.error("Database error:", dbError)
        return NextResponse.json({ error: "Failed to save resume record" }, { status: 500 })
      }

      return NextResponse.json({
        id: resume.id,
        url: blob.url,
        filename: file.name,
        size: file.size,
        type: file.type,
        status: "uploaded",
      })
    } catch (dbError) {
      // Handle database connection or table missing errors
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          error: "Database not initialized. Please run the database setup scripts first.",
          setupRequired: true,
          id: null,
          url: blob.url,
          filename: file.name,
          size: file.size,
          type: file.type,
          status: "uploaded_no_db",
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
