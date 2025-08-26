"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Filter, X, Save, History } from "lucide-react"

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

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  onSaveSearch?: (name: string, filters: SearchFilters) => void
  savedSearches?: Array<{ name: string; filters: SearchFilters }>
  onLoadSearch?: (filters: SearchFilters) => void
}

export function AdvancedSearch({ onSearch, onSaveSearch, savedSearches = [], onLoadSearch }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
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

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [skillInput, setSkillInput] = useState("")
  const [saveSearchName, setSaveSearchName] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const handleSearch = () => {
    onSearch(filters)
    // Log search for analytics
    logSearch(filters)
  }

  const logSearch = async (searchFilters: SearchFilters) => {
    try {
      await fetch("/api/search-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchFilters.query,
          filters: searchFilters,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error("Failed to log search:", error)
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !filters.skills.includes(skillInput.trim())) {
      setFilters({ ...filters, skills: [...filters.skills, skillInput.trim()] })
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setFilters({ ...filters, skills: filters.skills.filter((s) => s !== skill) })
  }

  const clearFilters = () => {
    setFilters({
      query: "",
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

  const handleSaveSearch = () => {
    if (saveSearchName.trim() && onSaveSearch) {
      onSaveSearch(saveSearchName.trim(), filters)
      setSaveSearchName("")
      setShowSaveDialog(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Advanced Search
            </CardTitle>
            <CardDescription>Find the perfect candidates with powerful search filters</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Filter className="mr-2 h-4 w-4" />
              {showAdvanced ? "Simple" : "Advanced"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(!showSaveDialog)}>
              <Save className="mr-2 h-4 w-4" />
              Save Search
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Search Query */}
        <div className="space-y-2">
          <Label htmlFor="search-query">Search Query</Label>
          <div className="flex gap-2">
            <Input
              id="search-query"
              placeholder="Search by name, skills, company, job title, or keywords..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use quotes for exact phrases, AND/OR for boolean search, - to exclude terms
          </p>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="City, State, or Remote"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience-level">Experience Level</Label>
            <Select
              value={filters.experienceLevel}
              onValueChange={(value) => setFilters({ ...filters, experienceLevel: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education-level">Education Level</Label>
            <Select
              value={filters.educationLevel}
              onValueChange={(value) => setFilters({ ...filters, educationLevel: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select education" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high-school">High School</SelectItem>
                <SelectItem value="associate">Associate Degree</SelectItem>
                <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                <SelectItem value="master">Master's Degree</SelectItem>
                <SelectItem value="phd">PhD/Doctorate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Skills Filter */}
        <div className="space-y-2">
          <Label>Required Skills</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addSkill()}
            />
            <Button type="button" onClick={addSkill} variant="outline">
              Add
            </Button>
          </div>
          {filters.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <>
            <Separator />
            <div className="space-y-6">
              <h3 className="font-semibold">Advanced Filters</h3>

              {/* Experience Years */}
              <div className="space-y-2">
                <Label>
                  Years of Experience: {filters.experienceYears[0]} - {filters.experienceYears[1]} years
                </Label>
                <Slider
                  value={filters.experienceYears}
                  onValueChange={(value) => setFilters({ ...filters, experienceYears: value })}
                  max={20}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Salary Range */}
              <div className="space-y-2">
                <Label>
                  Salary Range: ${filters.salaryRange[0].toLocaleString()} - ${filters.salaryRange[1].toLocaleString()}
                </Label>
                <Slider
                  value={filters.salaryRange}
                  onValueChange={(value) => setFilters({ ...filters, salaryRange: value })}
                  max={300000}
                  min={20000}
                  step={5000}
                  className="w-full"
                />
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={filters.availability}
                  onValueChange={(value) => setFilters({ ...filters, availability: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Available Immediately</SelectItem>
                    <SelectItem value="2weeks">2 Weeks Notice</SelectItem>
                    <SelectItem value="1month">1 Month Notice</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                    <SelectItem value="not-looking">Not Currently Looking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Industry Experience */}
              <div className="space-y-2">
                <Label>Industry Experience</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    "Technology",
                    "Healthcare",
                    "Finance",
                    "Education",
                    "Manufacturing",
                    "Retail",
                    "Consulting",
                    "Government",
                  ].map((industry) => (
                    <div key={industry} className="flex items-center space-x-2">
                      <Checkbox
                        id={industry}
                        checked={filters.industries.includes(industry)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters({ ...filters, industries: [...filters.industries, industry] })
                          } else {
                            setFilters({ ...filters, industries: filters.industries.filter((i) => i !== industry) })
                          }
                        }}
                      />
                      <Label htmlFor={industry} className="text-sm">
                        {industry}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Saved Searches
              </Label>
              <div className="flex flex-wrap gap-2">
                {savedSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onLoadSearch?.(search.filters)}
                    className="text-xs"
                  >
                    {search.name}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Save Search Dialog */}
        {showSaveDialog && (
          <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
            <Label htmlFor="search-name">Save Search As:</Label>
            <div className="flex gap-2">
              <Input
                id="search-name"
                placeholder="Enter search name..."
                value={saveSearchName}
                onChange={(e) => setSaveSearchName(e.target.value)}
              />
              <Button onClick={handleSaveSearch} size="sm">
                Save
              </Button>
              <Button onClick={() => setShowSaveDialog(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={clearFilters}>
            Clear All Filters
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSearch}>
              Search
            </Button>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Find Candidates
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
