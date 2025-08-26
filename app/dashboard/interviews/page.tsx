"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Video, Phone, MapPin, Star, MessageSquare, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Interview {
  id: string
  application_id: string
  candidate_name: string
  job_title: string
  scheduled_at: string
  duration_minutes: number
  interview_type: "video" | "phone" | "in-person"
  meeting_link?: string
  location?: string
  status: "scheduled" | "completed" | "cancelled" | "rescheduled"
  rating?: number
  interviewer_notes?: string
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      const response = await fetch("/api/interviews")
      if (!response.ok) {
        throw new Error("Failed to fetch interviews")
      }
      const data = await response.json()
      setInterviews(data.interviews || [])
    } catch (error) {
      console.error("Error fetching interviews:", error)
      setError("Failed to load interviews")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "rescheduled":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "phone":
        return <Phone className="h-4 w-4" />
      case "in-person":
        return <MapPin className="h-4 w-4" />
      default:
        return <Video className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded-lg w-48"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-white/10 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-8 text-center">
              <div className="text-red-400 mb-4">
                <MessageSquare className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Error Loading Interviews</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <Button onClick={fetchInterviews} className="bg-purple-600 hover:bg-purple-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const upcomingInterviews = interviews.filter((i) => i.status === "scheduled" && new Date(i.scheduled_at) > new Date())
  const completedInterviews = interviews.filter((i) => i.status === "completed")
  const allInterviews = interviews

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Interview Management</h1>
            <p className="text-gray-300 mt-1">Schedule and manage candidate interviews</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Upcoming</p>
                  <p className="text-2xl font-bold text-white">{upcomingInterviews.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">{completedInterviews.length}</p>
                </div>
                <Star className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">This Week</p>
                  <p className="text-2xl font-bold text-white">
                    {
                      interviews.filter((i) => {
                        const interviewDate = new Date(i.scheduled_at)
                        const now = new Date()
                        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                        return interviewDate >= now && interviewDate <= weekFromNow
                      }).length
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Avg Rating</p>
                  <p className="text-2xl font-bold text-white">
                    {completedInterviews.length > 0
                      ? (
                          completedInterviews.reduce((acc, i) => acc + (i.rating || 0), 0) / completedInterviews.length
                        ).toFixed(1)
                      : "0.0"}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interview Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-md border-white/20">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-purple-600">
              Upcoming ({upcomingInterviews.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-purple-600">
              Completed ({completedInterviews.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
              All ({allInterviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingInterviews.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Upcoming Interviews</h3>
                  <p className="text-gray-300">Schedule interviews with candidates to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedInterviews.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-8 text-center">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Completed Interviews</h3>
                  <p className="text-gray-300">Completed interviews will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {allInterviews.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Interviews Yet</h3>
                  <p className="text-gray-300">Start scheduling interviews with candidates.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function InterviewCard({ interview }: { interview: Interview }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "rescheduled":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "phone":
        return <Phone className="h-4 w-4" />
      case "in-person":
        return <MapPin className="h-4 w-4" />
      default:
        return <Video className="h-4 w-4" />
    }
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-white text-lg">{interview.candidate_name}</CardTitle>
            <p className="text-gray-300 text-sm">{interview.job_title}</p>
          </div>
          <Badge className={`${getStatusColor(interview.status)} border`}>{interview.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-gray-300">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{formatDate(interview.scheduled_at)}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          {getTypeIcon(interview.interview_type)}
          <span className="text-sm capitalize">{interview.interview_type}</span>
          <span className="text-xs text-gray-400">• {interview.duration_minutes}min</span>
        </div>

        {interview.rating && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < interview.rating! ? "text-yellow-400 fill-current" : "text-gray-600"}`}
              />
            ))}
            <span className="text-sm text-gray-300 ml-2">{interview.rating}/5</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
            View Details
          </Button>
          {interview.status === "scheduled" && (
            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              Reschedule
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
