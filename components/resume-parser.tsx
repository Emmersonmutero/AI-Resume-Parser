"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"

interface Resume {
  id: string
  filename: string
  file_size: number
  created_at: string
}

interface ParsedData {
  personalInfo: {
    fullName: string
    email?: string
    phone?: string
    location?: string
  }
  experience: Array<{
    company: string
    position: string
    startDate: string
    endDate?: string
    description: string
  }>
  education: Array<{
    institution: string
    degree: string
    field?: string
  }>
  skills: {
    technical: string[]
    soft: string[]
  }
}

interface ResumeParserProps {
  resume: Resume
  onParsingComplete?: (parsedData: ParsedData) => void
}

export function ResumeParser({ resume, onParsingComplete }: ResumeParserProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [parsingStatus, setParsingStatus] = useState<"idle" | "processing" | "completed" | "failed">("idle")

  const handleParseResume = async () => {
    setIsLoading(true)
    setParsingStatus("processing")

    try {
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeId: resume.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse resume")
      }

      setParsedData(data.parsedData)
      setParsingStatus("completed")
      onParsingComplete?.(data.parsedData)
      toast.success("Resume parsed successfully!")
    } catch (error) {
      console.error("Parsing error:", error)
      setParsingStatus("failed")
      toast.error(error instanceof Error ? error.message : "Failed to parse resume")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (parsingStatus) {
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusText = () => {
    switch (parsingStatus) {
      case "processing":
        return "Parsing..."
      case "completed":
        return "Parsed"
      case "failed":
        return "Failed"
      default:
        return "Ready to parse"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {resume.filename}
          </CardTitle>
          <CardDescription>
            Size: {(resume.file_size / 1024).toFixed(1)} KB • Uploaded:{" "}
            {new Date(resume.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">{getStatusText()}</span>
            </div>
            <Button onClick={handleParseResume} disabled={isLoading || parsingStatus === "completed"}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing...
                </>
              ) : parsingStatus === "completed" ? (
                "Parsed"
              ) : (
                "Parse Resume"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {parsedData && (
        <Card>
          <CardHeader>
            <CardTitle>Parsed Resume Data</CardTitle>
            <CardDescription>Extracted information from {resume.filename}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {parsedData.personalInfo.fullName}
                </div>
                {parsedData.personalInfo.email && (
                  <div>
                    <span className="font-medium">Email:</span> {parsedData.personalInfo.email}
                  </div>
                )}
                {parsedData.personalInfo.phone && (
                  <div>
                    <span className="font-medium">Phone:</span> {parsedData.personalInfo.phone}
                  </div>
                )}
                {parsedData.personalInfo.location && (
                  <div>
                    <span className="font-medium">Location:</span> {parsedData.personalInfo.location}
                  </div>
                )}
              </div>
            </div>

            {/* Experience */}
            {parsedData.experience.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Experience</h3>
                <div className="space-y-3">
                  {parsedData.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4">
                      <div className="font-medium">{exp.position}</div>
                      <div className="text-sm text-muted-foreground">{exp.company}</div>
                      <div className="text-xs text-muted-foreground">
                        {exp.startDate} - {exp.endDate || "Present"}
                      </div>
                      <div className="text-sm mt-1">{exp.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {parsedData.education.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Education</h3>
                <div className="space-y-2">
                  {parsedData.education.map((edu, index) => (
                    <div key={index}>
                      <div className="font-medium">{edu.degree}</div>
                      <div className="text-sm text-muted-foreground">
                        {edu.institution} {edu.field && `• ${edu.field}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            <div>
              <h3 className="font-semibold mb-2">Skills</h3>
              <div className="space-y-3">
                {parsedData.skills.technical.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-1">Technical Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {parsedData.skills.technical.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {parsedData.skills.soft.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-1">Soft Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {parsedData.skills.soft.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
