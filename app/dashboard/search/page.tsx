"use client"

import { useState, useEffect } from "react"
import { AdvancedSearch } from "@/components/advanced-search"
import { CandidateCard } from "@/components/candidate-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, Clock, Search } from "lucide-react"
import { toast } from "sonner"

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

interface SearchResult {
  id: string
  user_id: string
  parsed_data: any
  parsing_confidence: number
  created_at: string
}

interface SearchAnalytics {
  recentSearches: any[]
  popularQueries: Array<{ query: string; count: number }>
  totalSearches: number
}

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null)
  const [savedSearches, setSavedSearches] = useState<Array<{ name: string; filters: SearchFilters }>>([])
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null)

  useEffect(() => {
    fetchAnalytics()
    loadSavedSearches()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/search-logs")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    }
  }

  const loadSavedSearches = () => {
    const saved = localStorage.getItem("savedSearches")
    if (saved) {
      setSavedSearches(JSON.parse(saved))
    }
  }

  const handleSearch = async (filters: SearchFilters) => {
    setLoading(true)
    setCurrentFilters(filters)

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      })

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      setSearchResults(data.results)
      toast.success(`Found ${data.totalCount} candidates`)
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Search failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSearch = (name: string, filters: SearchFilters) => {
    const newSavedSearches = [...savedSearches, { name, filters }]
    setSavedSearches(newSavedSearches)
    localStorage.setItem("savedSearches", JSON.stringify(newSavedSearches))
    toast.success("Search saved successfully!")
  }

  const handleLoadSearch = (filters: SearchFilters) => {
    handleSearch(filters)
  }

  const handleViewProfile = (candidateId: string) => {
    window.open(`/dashboard/candidates/${candidateId}`, "_blank")
  }

  const handleContact = (candidate: SearchResult) => {
    const email = candidate.parsed_data.personalInfo.email
    if (email) {
      window.open(`mailto:${email}?subject=Job Opportunity`, "_blank")
    } else {
      toast.error("No email address available for this candidate")
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Advanced Candidate Search</h1>
        <p className="text-muted-foreground mt-2">
          Find the perfect candidates with powerful search and filtering tools
        </p>
      </div>

      {/* Search Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSearches}</div>
              <p className="text-xs text-muted-foreground">All time searches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.recentSearches.length}</div>
              <p className="text-xs text-muted-foreground">Searches this session</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Popular Queries</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.popularQueries.length}</div>
              <p className="text-xs text-muted-foreground">Unique search terms</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Popular Queries */}
      {analytics && analytics.popularQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Search Terms</CardTitle>
            <CardDescription>Click on any term to search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.popularQueries.slice(0, 10).map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSearch({
                      query: query.query,
                      skills: [],
                      location: "",
                      experienceLevel: "",
                      educationLevel: "",
                      experienceYears: [0, 20],
                      companies: [],
                      jobTitles: [],
                      industries: [],
                      availability: "",
                      salaryRange: [30000, 200000],
                    })
                  }
                  className="text-xs"
                >
                  {query.query} ({query.count})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Search Component */}
      <AdvancedSearch
        onSearch={handleSearch}
        onSaveSearch={handleSaveSearch}
        savedSearches={savedSearches}
        onLoadSearch={handleLoadSearch}
      />

      {/* Search Results */}
      {loading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Searching candidates...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {currentFilters && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Search Results ({searchResults.length} candidates found)
            </CardTitle>
            <CardDescription>
              {currentFilters.query && (
                <span>
                  Query: "<strong>{currentFilters.query}</strong>"
                </span>
              )}
              {currentFilters.skills.length > 0 && (
                <span className="ml-4">
                  Skills:{" "}
                  {currentFilters.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="ml-1">
                      {skill}
                    </Badge>
                  ))}
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate.parsed_data}
              onViewProfile={() => handleViewProfile(candidate.id)}
              onContact={() => handleContact(candidate)}
            />
          ))}
        </div>
      )}

      {currentFilters && searchResults.length === 0 && !loading && (
        <Card>
          <CardHeader className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No Candidates Found</CardTitle>
            <CardDescription>Try adjusting your search criteria or filters to find more candidates</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
