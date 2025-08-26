"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Briefcase, MapPin, Clock, Users, Search, Database, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface JobDescription {
  id: string
  title: string
  company: string
  location: string
  employment_type: string
  experience_level: string
  description: string
  required_skills: string[]
  preferred_skills: string[]
  salary_range: string
  status: string
  created_at: string
  match_count?: number
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobDescription[]>([])
  const [loading, setLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("job_descriptions")
        .select(`
          *,
          resume_matches(count)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        if (
          error.message.includes("Could not find the table") ||
          (error.message.includes("relation") && error.message.includes("does not exist"))
        ) {
          setNeedsSetup(true)
          return
        }
        throw error
      }

      // Process the data to include match counts
      const jobsWithCounts = (data || []).map((job) => ({
        ...job,
        match_count: job.resume_matches?.[0]?.count || 0,
      }))

      setJobs(jobsWithCounts)
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("Failed to load job descriptions")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getEmploymentTypeIcon = (type: string) => {
    switch (type) {
      case "remote":
        return "🏠"
      case "hybrid":
        return "🏢"
      case "on-site":
        return "🏢"
      default:
        return "💼"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (needsSetup) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">Database Setup Required</CardTitle>
            <CardDescription className="text-base">
              The job descriptions table hasn't been created yet. Please run the database setup scripts to initialize
              the system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">Required Setup Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                    <li>Run the database setup scripts in order (001-009)</li>
                    <li>Ensure all tables are created successfully</li>
                    <li>Refresh this page to continue</li>
                  </ol>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                <Database className="mr-2 h-4 w-4" />
                Check Database Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Descriptions</h1>
          <p className="text-muted-foreground mt-2">Manage job postings and find matching candidates</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/jobs/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Job
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.filter((job) => job.status === "active").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.reduce((sum, job) => sum + (job.match_count || 0), 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Matches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.length > 0
                ? Math.round(jobs.reduce((sum, job) => sum + (job.match_count || 0), 0) / jobs.length)
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No Job Descriptions</CardTitle>
            <CardDescription>Create your first job description to start matching candidates</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/dashboard/jobs/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Job Description
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                    <CardDescription className="text-base mt-1">{job.company}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(job.status)} variant="secondary">
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{getEmploymentTypeIcon(job.employment_type)}</span>
                    <span className="capitalize">{job.employment_type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {job.experience_level}
                  </Badge>
                  {job.salary_range && (
                    <Badge variant="outline" className="text-xs">
                      {job.salary_range}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>

                {/* Top Skills */}
                {job.required_skills.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Required Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {job.required_skills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.required_skills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.required_skills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Match Count */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm text-muted-foreground">{job.match_count || 0} candidate matches</div>
                  <div className="text-xs text-muted-foreground">{new Date(job.created_at).toLocaleDateString()}</div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                    <Link href={`/dashboard/jobs/${job.id}/matches`}>
                      <Users className="mr-2 h-4 w-4" />
                      View Matches
                    </Link>
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/dashboard/jobs/${job.id}`}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Manage
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
