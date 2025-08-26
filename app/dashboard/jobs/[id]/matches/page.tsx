"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Users, Star, Mail, Phone, MapPin, Briefcase, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface JobMatch {
  id: string
  match_score: number
  match_details: {
    overallScore: number
    skillsMatch: {
      score: number
      matchedSkills: string[]
      missingSkills: string[]
      explanation: string
    }
    experienceMatch: {
      score: number
      relevantExperience: string[]
      explanation: string
    }
    educationMatch: {
      score: number
      meetsRequirements: boolean
      explanation: string
    }
    locationMatch: {
      score: number
      compatible: boolean
      explanation: string
    }
    culturalFit: {
      score: number
      strengths: string[]
      explanation: string
    }
    recommendations: string[]
    summary: string
  }
  parsed_resumes: {
    id: string
    parsed_data: {
      personalInfo: {
        fullName: string
        email?: string
        phone?: string
        location?: string
      }
      summary?: string
      experience: any[]
      education: any[]
      skills: {
        technical: string[]
        soft: string[]
      }
    }
  }
  created_at: string
}

interface JobDescription {
  id: string
  title: string
  company: string
  location: string
  employment_type: string
  experience_level: string
  required_skills: string[]
}

export default function JobMatchesPage() {
  const params = useParams()
  const [job, setJob] = useState<JobDescription | null>(null)
  const [matches, setMatches] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [matching, setMatching] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (params.id) {
      fetchJobAndMatches(params.id as string)
    }
  }, [params.id])

  const fetchJobAndMatches = async (jobId: string) => {
    try {
      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from("job_descriptions")
        .select("*")
        .eq("id", jobId)
        .single()

      if (jobError) throw jobError
      setJob(jobData)

      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from("resume_matches")
        .select(`
          *,
          parsed_resumes (
            id,
            parsed_data
          )
        `)
        .eq("job_id", jobId)
        .order("match_score", { ascending: false })

      if (matchesError) throw matchesError
      setMatches(matchesData || [])
    } catch (error) {
      console.error("Error fetching job matches:", error)
      toast.error("Failed to load job matches")
    } finally {
      setLoading(false)
    }
  }

  const handleRunMatching = async () => {
    if (!params.id) return

    setMatching(true)
    try {
      const response = await fetch("/api/match-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: params.id }),
      })

      if (!response.ok) {
        throw new Error("Failed to run matching")
      }

      const data = await response.json()
      toast.success(`Matching completed! Found ${data.matchesCreated} matches.`)

      // Refresh the matches
      await fetchJobAndMatches(params.id as string)
    } catch (error) {
      console.error("Error running matching:", error)
      toast.error("Failed to run candidate matching")
    } finally {
      setMatching(false)
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800"
    if (score >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Job Not Found</CardTitle>
            <CardDescription>The job description you're looking for doesn't exist.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <p className="text-muted-foreground mt-1">
              {job.company} • {job.location} • {matches.length} matches found
            </p>
          </div>
        </div>
        <Button onClick={handleRunMatching} disabled={matching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${matching ? "animate-spin" : ""}`} />
          {matching ? "Matching..." : "Run Matching"}
        </Button>
      </div>

      {/* Job Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium mb-2">Experience Level</div>
              <Badge variant="outline">{job.experience_level}</Badge>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Employment Type</div>
              <Badge variant="outline">{job.employment_type}</Badge>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Location</div>
              <Badge variant="outline">{job.location}</Badge>
            </div>
          </div>
          {job.required_skills.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Required Skills</div>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matches */}
      {matches.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No Matches Found</CardTitle>
            <CardDescription>
              {matching
                ? "Matching is in progress. Please wait..."
                : "Run candidate matching to find suitable candidates for this position."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleRunMatching} disabled={matching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${matching ? "animate-spin" : ""}`} />
              {matching ? "Matching..." : "Find Candidates"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Candidate Matches</h2>
            <div className="text-sm text-muted-foreground">Sorted by match score (highest first)</div>
          </div>

          {matches.map((match) => {
            const candidate = match.parsed_resumes.parsed_data
            const details = match.match_details

            return (
              <Card key={match.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg">
                          {getInitials(candidate.personalInfo.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl">{candidate.personalInfo.fullName}</CardTitle>
                          <Badge className={getScoreBadgeColor(match.match_score)} variant="secondary">
                            <Star className="mr-1 h-3 w-3" />
                            {match.match_score}% match
                          </Badge>
                        </div>
                        {candidate.summary && (
                          <CardDescription className="mt-2 line-clamp-2">{candidate.summary}</CardDescription>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {candidate.personalInfo.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{candidate.personalInfo.location}</span>
                            </div>
                          )}
                          {candidate.personalInfo.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{candidate.personalInfo.email}</span>
                            </div>
                          )}
                          {candidate.personalInfo.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{candidate.personalInfo.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Match Summary */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">AI Match Summary</h4>
                    <p className="text-sm text-muted-foreground">{details.summary}</p>
                  </div>

                  {/* Detailed Scores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Skills</span>
                        <span className={`text-sm font-bold ${getScoreColor(details.skillsMatch.score)}`}>
                          {details.skillsMatch.score}%
                        </span>
                      </div>
                      <Progress value={details.skillsMatch.score} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Experience</span>
                        <span className={`text-sm font-bold ${getScoreColor(details.experienceMatch.score)}`}>
                          {details.experienceMatch.score}%
                        </span>
                      </div>
                      <Progress value={details.experienceMatch.score} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Education</span>
                        <span className={`text-sm font-bold ${getScoreColor(details.educationMatch.score)}`}>
                          {details.educationMatch.score}%
                        </span>
                      </div>
                      <Progress value={details.educationMatch.score} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Location</span>
                        <span className={`text-sm font-bold ${getScoreColor(details.locationMatch.score)}`}>
                          {details.locationMatch.score}%
                        </span>
                      </div>
                      <Progress value={details.locationMatch.score} className="h-2" />
                    </div>
                  </div>

                  {/* Skills Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {details.skillsMatch.matchedSkills.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-green-700">Matched Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {details.skillsMatch.matchedSkills.map((skill, index) => (
                            <Badge key={index} variant="default" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {details.skillsMatch.missingSkills.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-red-700">Missing Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {details.skillsMatch.missingSkills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recommendations */}
                  {details.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">AI Recommendations</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {details.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/candidates/${match.parsed_resumes.id}`}>View Full Profile</Link>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (candidate.personalInfo.email) {
                          window.open(
                            `mailto:${candidate.personalInfo.email}?subject=Job Opportunity: ${job.title}`,
                            "_blank",
                          )
                        } else {
                          toast.error("No email address available")
                        }
                      }}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Candidate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
