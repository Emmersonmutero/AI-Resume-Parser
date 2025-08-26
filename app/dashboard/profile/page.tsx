"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Code, Edit, Download, Share } from "lucide-react"
import { toast } from "sonner"

interface ParsedResume {
  id: string
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

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      // Get user profile
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Get latest parsed resume
      const { data: resumeData, error: resumeError } = await supabase
        .from("parsed_resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (resumeData) {
        setParsedResume(resumeData)
      }
    } catch (error) {
      console.error("Error fetching profile data:", error)
      toast.error("Failed to load profile data")
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

  if (!parsedResume) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No Profile Data Found</CardTitle>
            <CardDescription>Upload and parse a resume to create your candidate profile</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <a href="/dashboard/upload">Upload Resume</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { personalInfo, summary, experience, education, skills, certifications, projects } = parsedResume.parsed_data

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Candidate Profile</h1>
          <p className="text-muted-foreground mt-1">
            Confidence Score: {Math.round(parsedResume.parsing_confidence * 100)}%
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Share className="mr-2 h-4 w-4" />
            Share Profile
          </Button>
        </div>
      </div>

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
                {profile?.role && (
                  <Badge variant="secondary" className="mt-1">
                    {profile.role}
                  </Badge>
                )}
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

      {/* Experience Section */}
      {experience.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {experience.map((exp, index) => (
              <div key={index}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{exp.position}</h3>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {exp.startDate} - {exp.endDate || "Present"}
                    </p>
                    <p className="text-muted-foreground leading-relaxed mb-3">{exp.description}</p>
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Key Achievements:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {exp.achievements.map((achievement, achIndex) => (
                            <li key={achIndex}>{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                {index < experience.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {education.map((edu, index) => (
              <div key={index} className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{edu.degree}</h3>
                  {edu.field && <p className="text-muted-foreground">{edu.field}</p>}
                  <p className="text-blue-600 font-medium">{edu.institution}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    {edu.graduationDate && <span>Graduated: {edu.graduationDate}</span>}
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Skills & Expertise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {skills.technical.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.technical.map((skill, index) => (
                  <Badge key={index} variant="default">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {skills.soft.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Soft Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.soft.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {skills.languages && skills.languages.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {skills.languages.map((language, index) => (
                  <Badge key={index} variant="outline">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certifications Section */}
      {certifications && certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{cert.name}</h3>
                  <p className="text-blue-600 font-medium">{cert.issuer}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    {cert.date && <span>Issued: {cert.date}</span>}
                    {cert.expiryDate && <span>Expires: {cert.expiryDate}</span>}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Projects Section */}
      {projects && projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {projects.map((project, index) => (
              <div key={index}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      {project.url && (
                        <a
                          href={project.url}
                          className="text-blue-600 hover:underline text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Project
                        </a>
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-3">{project.description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {index < projects.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
