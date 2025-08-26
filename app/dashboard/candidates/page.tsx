"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { CandidateCard } from "@/components/candidate-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Users, Search, Database, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ParsedResume {
  id: string
  user_id: string
  parsed_data: {
    personalInfo: {
      fullName: string
      email?: string
      phone?: string
      location?: string
    }
    summary?: string
    experience: Array<{
      company: string
      position: string
      startDate: string
      endDate?: string
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
  parsing_confidence: number
  created_at: string
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<ParsedResume[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<ParsedResume[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [skillFilter, setSkillFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [databaseError, setDatabaseError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchCandidates()
  }, [])

  useEffect(() => {
    filterCandidates()
  }, [candidates, searchTerm, skillFilter, locationFilter])

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from("parsed_resumes")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        if (error.message.includes("table") && error.message.includes("does not exist")) {
          setDatabaseError("Database tables not found. Please run the setup scripts first.")
          return
        }
        throw error
      }
      setCandidates(data || [])
      setDatabaseError(null)
    } catch (error) {
      console.error("Error fetching candidates:", error)
      if (error instanceof Error && error.message.includes("schema cache")) {
        setDatabaseError("Database schema not initialized. Please run the setup scripts.")
      } else {
        toast.error("Failed to load candidates")
      }
    } finally {
      setLoading(false)
    }
  }

  const filterCandidates = () => {
    let filtered = candidates

    if (searchTerm) {
      filtered = filtered.filter((candidate) => {
        const { personalInfo, experience } = candidate.parsed_data
        const searchLower = searchTerm.toLowerCase()

        return (
          personalInfo.fullName.toLowerCase().includes(searchLower) ||
          experience.some(
            (exp) =>
              exp.position.toLowerCase().includes(searchLower) || exp.company.toLowerCase().includes(searchLower),
          )
        )
      })
    }

    if (skillFilter) {
      filtered = filtered.filter((candidate) => {
        const { skills } = candidate.parsed_data
        return skills.technical.some((skill) => skill.toLowerCase().includes(skillFilter.toLowerCase()))
      })
    }

    if (locationFilter) {
      filtered = filtered.filter((candidate) => {
        const { personalInfo } = candidate.parsed_data
        return personalInfo.location?.toLowerCase().includes(locationFilter.toLowerCase())
      })
    }

    setFilteredCandidates(filtered)
  }

  const handleViewProfile = (candidateId: string) => {
    window.open(`/dashboard/candidates/${candidateId}`, "_blank")
  }

  const handleContact = (candidate: ParsedResume) => {
    const email = candidate.parsed_data.personalInfo.email
    if (email) {
      window.open(`mailto:${email}?subject=Job Opportunity`, "_blank")
    } else {
      toast.error("No email address available for this candidate")
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

  if (databaseError) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Candidate Database</h1>
          <p className="text-muted-foreground mt-2">AI-powered resume parsing and candidate management</p>
        </div>

        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Database Setup Required</AlertTitle>
          <AlertDescription className="text-amber-700">{databaseError}</AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="text-center">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Database Setup Required</CardTitle>
            <CardDescription className="max-w-2xl mx-auto">
              The AI Resume Parser database needs to be initialized before you can start managing candidates. Please run
              the database setup scripts to create the required tables and schema.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg text-left max-w-2xl mx-auto">
              <h4 className="font-semibold mb-2">Required Setup Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  Run script: <code className="bg-gray-200 px-1 rounded">001_create_profiles.sql</code>
                </li>
                <li>
                  Run script: <code className="bg-gray-200 px-1 rounded">002_create_resumes.sql</code>
                </li>
                <li>
                  Run script: <code className="bg-gray-200 px-1 rounded">003_create_parsed_resumes.sql</code>
                </li>
                <li>
                  Run script: <code className="bg-gray-200 px-1 rounded">004_create_job_descriptions.sql</code>
                </li>
                <li>
                  Run script: <code className="bg-gray-200 px-1 rounded">005_create_resume_matches.sql</code>
                </li>
                <li>
                  Run script: <code className="bg-gray-200 px-1 rounded">006_create_search_logs.sql</code>
                </li>
                <li>
                  Run script: <code className="bg-gray-200 px-1 rounded">007_create_parsing_jobs.sql</code>
                </li>
                <li>
                  Run script: <code className="bg-gray-200 px-1 rounded">008_create_profile_trigger.sql</code>
                </li>
                <li>
                  Run script: <code className="bg-gray-200 px-1 rounded">009_update_viewer_to_candidate.sql</code>
                </li>
              </ol>
            </div>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Refresh Page After Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Candidate Database</h1>
        <p className="text-muted-foreground mt-2">Browse and search through {candidates.length} candidate profiles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Candidates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by name, position, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Input
                placeholder="Filter by skill..."
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              />
            </div>
            <div>
              <Input
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCandidates.length} of {candidates.length} candidates
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("")
                setSkillFilter("")
                setLocationFilter("")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {filteredCandidates.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No Candidates Found</CardTitle>
            <CardDescription>
              {candidates.length === 0
                ? "No candidates have been added to the database yet"
                : "No candidates match your current search criteria"}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate.parsed_data}
              onViewProfile={() => handleViewProfile(candidate.id)}
              onContact={() => handleContact(candidate)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
