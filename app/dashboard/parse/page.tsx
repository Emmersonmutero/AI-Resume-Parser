"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { ResumeParser } from "@/components/resume-parser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Resume {
  id: string
  filename: string
  file_size: number
  created_at: string
}

export default function ParsePage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from("resumes")
        .select("id, filename, file_size, created_at")
        .order("created_at", { ascending: false })

      if (error) throw error
      setResumes(data || [])
    } catch (error) {
      console.error("Error fetching resumes:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Parse Resumes</h1>
        <p className="text-muted-foreground mt-2">Extract structured data from your uploaded resumes using AI</p>
      </div>

      {resumes.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No Resumes Found</CardTitle>
            <CardDescription>Upload some resumes first to start parsing them</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/dashboard/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload Resumes
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {resumes.map((resume) => (
            <ResumeParser
              key={resume.id}
              resume={resume}
              onParsingComplete={(parsedData) => {
                console.log("[v0] Parsing completed for:", resume.filename, parsedData)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
