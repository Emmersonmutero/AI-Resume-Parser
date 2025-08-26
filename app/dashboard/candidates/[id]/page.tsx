"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, User, Mail, Phone, MapPin, Download, Share, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface ParsedResume {
  id: string
  user_id: string
  parsed_data: {
    personalInfo: {
      fullName: string
      email?: string
      phone?: string
      location?: string
      linkedIn?: string
      website?: string
    }
    summary?: string
    experience: Array<{
      company: string
      position: string
      startDate: string
      endDate?: string
      description: string
      achievements?: string[]
    }>
    education: Array<{
      institution: string
      degree: string
      field?: string
      graduationDate?: string
      gpa?: string
    }>
    skills: {
      technical: string[]
      soft: string[]
      languages?: string[]
    }
    certifications?: Array<{
      name: string
      issuer: string
      date?: string
      expiryDate?: string
    }>
    projects?: Array<{
      name: string
      description: string
      technologies?: string[]
      url?: string
    }>
  }
  parsing_confidence: number
  created_at: string
}

export default function CandidateDetailPage() {
  const params = useParams()
  const [candidate, setCandidate] = useState<ParsedResume | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (params.id) {
      fetchCandidate(params.id as string)
    }
  }, [params.id])

  const fetchCandidate = async (candidateId: string) => {
    try {
      const { data, error } = await supabase.from("parsed_resumes").select("*").eq("id", candidateId).single()

      if (error) throw error
      setCandidate(data)
    } catch (error) {
      console.error("Error fetching candidate:", error)
      toast.error("Failed to load candidate profile")
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleContact = () => {
    if (candidate?.parsed_data.personalInfo.email) {
      window.open(`mailto:${candidate.parsed_data.personalInfo.email}?subject=Job Opportunity`, "_blank")
    } else {
      toast.error("No email address available")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Candidate Not Found</CardTitle>
            <CardDescription>
              The candidate profile you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/dashboard/candidates">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Candidates
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { personalInfo, summary, experience, education, skills, certifications, projects } = candidate.parsed_data

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/candidates">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Candidates
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{personalInfo.fullName}</h1>
            <p className="text-muted-foreground mt-1">
              Profile Confidence: {Math.round(candidate.parsing_confidence * 100)}%
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleContact}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Contact Candidate
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Profile
          </Button>
          <Button variant="outline" size="sm">
            <Share className="mr-2 h-4 w-4" />
            Share Profile
          </Button>
        </div>
      </div>

      {/* Rest of the profile content - same as profile page but read-only */}
      {/* Personal Information Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">{getInitials(personalInfo.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{personalInfo.fullName}</h2>
                <Badge variant="secondary" className="mt-1">
                  Candidate
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {personalInfo.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{personalInfo.location}</span>
                  </div>
                )}
                {personalInfo.linkedIn && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <a href={personalInfo.linkedIn} className="text-blue-600 hover:underline">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>

              {summary && (
                <div>
                  <h3 className="font-semibold mb-2">Professional Summary</h3>
                  <p className="text-muted-foreground leading-relaxed">{summary}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience, Education, Skills sections - same as profile page */}
    </div>
  )
}
