"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MapPin, Mail, Briefcase, GraduationCap, ExternalLink, Star } from "lucide-react"

interface CandidateData {
  id: string
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

interface CandidateCardProps {
  candidate: CandidateData
  matchScore?: number
  onViewProfile?: () => void
  onContact?: () => void
}

export function CandidateCard({ candidate, matchScore, onViewProfile, onContact }: CandidateCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getCurrentPosition = () => {
    if (candidate.experience.length === 0) return null
    const current = candidate.experience.find((exp) => !exp.endDate) || candidate.experience[0]
    return current
  }

  const getLatestEducation = () => {
    return candidate.education[0] || null
  }

  const currentPosition = getCurrentPosition()
  const latestEducation = getLatestEducation()

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{getInitials(candidate.personalInfo.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{candidate.personalInfo.fullName}</CardTitle>
                {matchScore && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{matchScore}% match</span>
                  </div>
                )}
              </div>
              {currentPosition && (
                <CardDescription className="text-base mt-1">
                  {currentPosition.position} at {currentPosition.company}
                </CardDescription>
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
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {candidate.summary && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{candidate.summary}</p>
        )}

        {/* Experience Preview */}
        {currentPosition && (
          <div className="flex items-start gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <div className="font-medium">{currentPosition.position}</div>
              <div className="text-muted-foreground">{currentPosition.company}</div>
            </div>
          </div>
        )}

        {/* Education Preview */}
        {latestEducation && (
          <div className="flex items-start gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <div className="font-medium">{latestEducation.degree}</div>
              <div className="text-muted-foreground">{latestEducation.institution}</div>
            </div>
          </div>
        )}

        {/* Top Skills */}
        {candidate.skills.technical.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Top Skills</div>
            <div className="flex flex-wrap gap-1">
              {candidate.skills.technical.slice(0, 6).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.technical.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.skills.technical.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={onViewProfile}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Profile
          </Button>
          <Button size="sm" className="flex-1" onClick={onContact}>
            <Mail className="mr-2 h-4 w-4" />
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
