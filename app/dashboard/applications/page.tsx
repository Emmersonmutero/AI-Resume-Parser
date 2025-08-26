import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, MapPin, Building, Clock, Eye, MessageSquare } from "lucide-react"

export default async function ApplicationsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Sample application data
  const applications = [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      appliedDate: "2024-01-15",
      status: "interview",
      progress: 75,
      nextStep: "Technical Interview",
      nextStepDate: "2024-01-25",
      salary: "$120k - $150k",
    },
    {
      id: 2,
      jobTitle: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "Remote",
      appliedDate: "2024-01-12",
      status: "shortlisted",
      progress: 50,
      nextStep: "HR Interview",
      nextStepDate: "2024-01-22",
      salary: "$100k - $130k",
    },
    {
      id: 3,
      jobTitle: "React Developer",
      company: "Digital Agency",
      location: "New York, NY",
      appliedDate: "2024-01-10",
      status: "applied",
      progress: 25,
      nextStep: "Application Review",
      nextStepDate: null,
      salary: "$90k - $110k",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-600/20 text-blue-300 border-blue-500/30"
      case "shortlisted":
        return "bg-yellow-600/20 text-yellow-300 border-yellow-500/30"
      case "interview":
        return "bg-purple-600/20 text-purple-300 border-purple-500/30"
      case "hired":
        return "bg-green-600/20 text-green-300 border-green-500/30"
      case "rejected":
        return "bg-red-600/20 text-red-300 border-red-500/30"
      default:
        return "bg-slate-600/20 text-slate-300 border-slate-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">My Applications</h1>
            <p className="text-slate-400 mt-2">Track your job applications and interview progress</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-400">{applications.length}</div>
            <div className="text-sm text-slate-400">Active Applications</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Applied</p>
                  <p className="text-2xl font-bold text-blue-400">1</p>
                </div>
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Shortlisted</p>
                  <p className="text-2xl font-bold text-yellow-400">1</p>
                </div>
                <div className="p-3 bg-yellow-600/20 rounded-lg">
                  <Eye className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Interviews</p>
                  <p className="text-2xl font-bold text-purple-400">1</p>
                </div>
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-green-400">33%</p>
                </div>
                <div className="p-3 bg-green-600/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.map((application) => (
            <Card
              key={application.id}
              className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-purple-500/50 transition-colors"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{application.jobTitle}</h3>
                        <div className="flex items-center gap-4 mt-2 text-slate-400">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {application.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {application.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Applied {application.appliedDate}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-white">{application.progress}%</span>
                      </div>
                      <Progress value={application.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Next Step</p>
                        <p className="text-white font-medium">{application.nextStep}</p>
                        {application.nextStepDate && (
                          <p className="text-sm text-purple-400">{application.nextStepDate}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Salary Range</p>
                        <p className="text-white font-medium">{application.salary}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                    >
                      View Details
                    </Button>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Update Status
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
