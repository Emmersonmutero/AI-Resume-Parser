"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function CreateJobPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [skillInput, setSkillInput] = useState("")
  const [preferredSkillInput, setPreferredSkillInput] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    employment_type: "",
    experience_level: "",
    description: "",
    required_skills: [] as string[],
    preferred_skills: [] as string[],
    education_requirements: "",
    experience_requirements: "",
    salary_range: "",
    benefits: "",
    application_deadline: "",
    status: "active",
  })

  const addSkill = (type: "required" | "preferred") => {
    const input = type === "required" ? skillInput : preferredSkillInput
    const skillsArray = type === "required" ? formData.required_skills : formData.preferred_skills

    if (input.trim() && !skillsArray.includes(input.trim())) {
      setFormData({
        ...formData,
        [type === "required" ? "required_skills" : "preferred_skills"]: [...skillsArray, input.trim()],
      })

      if (type === "required") {
        setSkillInput("")
      } else {
        setPreferredSkillInput("")
      }
    }
  }

  const removeSkill = (skill: string, type: "required" | "preferred") => {
    const skillsArray = type === "required" ? formData.required_skills : formData.preferred_skills
    setFormData({
      ...formData,
      [type === "required" ? "required_skills" : "preferred_skills"]: skillsArray.filter((s) => s !== skill),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("job_descriptions").insert({
        ...formData,
        user_id: user.id,
      })

      if (error) throw error

      toast.success("Job description created successfully!")
      router.push("/dashboard/jobs")
    } catch (error) {
      console.error("Error creating job:", error)
      toast.error("Failed to create job description")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Job Description</h1>
          <p className="text-muted-foreground mt-1">Add a new job posting to find matching candidates</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about the position</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  placeholder="e.g. Tech Corp Inc."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g. San Francisco, CA or Remote"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employment_type">Employment Type *</Label>
                <Select
                  value={formData.employment_type}
                  onValueChange={(value) => setFormData({ ...formData, employment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_level">Experience Level *</Label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(value) => setFormData({ ...formData, experience_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="lead">Lead/Principal</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_range">Salary Range</Label>
                <Input
                  id="salary_range"
                  placeholder="e.g. $80,000 - $120,000"
                  value={formData.salary_range}
                  onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills & Requirements</CardTitle>
            <CardDescription>Define the skills and qualifications needed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Required Skills */}
            <div className="space-y-2">
              <Label>Required Skills *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a required skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("required"))}
                />
                <Button type="button" onClick={() => addSkill("required")} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.required_skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.required_skills.map((skill) => (
                    <Badge key={skill} variant="default" className="flex items-center gap-1">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill, "required")} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Preferred Skills */}
            <div className="space-y-2">
              <Label>Preferred Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a preferred skill..."
                  value={preferredSkillInput}
                  onChange={(e) => setPreferredSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("preferred"))}
                />
                <Button type="button" onClick={() => addSkill("preferred")} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.preferred_skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.preferred_skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill, "preferred")} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="education_requirements">Education Requirements</Label>
                <Textarea
                  id="education_requirements"
                  placeholder="e.g. Bachelor's degree in Computer Science or related field"
                  value={formData.education_requirements}
                  onChange={(e) => setFormData({ ...formData, education_requirements: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_requirements">Experience Requirements</Label>
                <Textarea
                  id="experience_requirements"
                  placeholder="e.g. 3+ years of experience in software development"
                  value={formData.experience_requirements}
                  onChange={(e) => setFormData({ ...formData, experience_requirements: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>Benefits, deadlines, and other information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits & Perks</Label>
              <Textarea
                id="benefits"
                placeholder="e.g. Health insurance, 401k, flexible hours, remote work options..."
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="application_deadline">Application Deadline</Label>
                <Input
                  id="application_deadline"
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/jobs">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Job Description"}
          </Button>
        </div>
      </form>
    </div>
  )
}
