import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MetricCard } from "@/components/dashboard/metric-card"
import { CircularProgress } from "@/components/dashboard/circular-progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, Briefcase, TrendingUp, CheckCircle, Clock, MoreHorizontal } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get dashboard metrics
  const { data: resumeCount } = await supabase
    .from("resumes")
    .select("id", { count: "exact" })
    .eq("user_id", data.user.id)

  const { data: parsedCount } = await supabase
    .from("parsed_resumes")
    .select("id", { count: "exact" })
    .eq("user_id", data.user.id)

  const { data: jobsCount } = await supabase
    .from("job_descriptions")
    .select("id", { count: "exact" })
    .eq("user_id", data.user.id)

  const { data: recentActivity } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Current Risk</h1>
          <div className="flex items-center space-x-4">
            <select className="bg-slate-800/50 border border-slate-700/50 text-white text-sm rounded-lg px-3 py-1">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white">Risk Score</span>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Resumes"
          value={`${resumeCount?.length || 0}`}
          percentage="Resume Files"
          color="red"
          icon={<FileText className="w-6 h-6 text-red-400" />}
        />
        <MetricCard
          title="Parsed Data"
          value={`${Math.round(((parsedCount?.length || 0) / Math.max(resumeCount?.length || 1, 1)) * 100)}%`}
          percentage="Processing Rate"
          color="purple"
          icon={<CheckCircle className="w-6 h-6 text-purple-400" />}
        />
        <MetricCard
          title="Active Jobs"
          value={`${jobsCount?.length || 0}`}
          percentage="Job Postings"
          color="pink"
          icon={<Briefcase className="w-6 h-6 text-pink-400" />}
        />
        <MetricCard
          title="Success Rate"
          value="94%"
          percentage="Parse Success"
          color="blue"
          icon={<TrendingUp className="w-6 h-6 text-blue-400" />}
        />
        <MetricCard
          title="Candidates"
          value={`${parsedCount?.length || 0}`}
          percentage="Parsed Profiles"
          color="cyan"
          icon={<Users className="w-6 h-6 text-cyan-400" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Parse Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <CircularProgress
                value={Math.round(((parsedCount?.length || 0) / Math.max(resumeCount?.length || 1, 1)) * 100)}
                size={140}
                color="url(#gradient)"
                label="Score"
              />
              <div className="text-center">
                <div className="text-sm text-slate-400">High</div>
                <div className="flex items-center justify-center space-x-4 mt-2">
                  <span className="text-xs text-slate-500">0</span>
                  <span className="text-xs text-slate-500">1000</span>
                </div>
              </div>
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>
            </CardContent>
          </Card>
        </div>

        {/* Activity Summary */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Activity Summary</CardTitle>
                <select className="bg-slate-700/50 border border-slate-600/50 text-white text-sm rounded px-2 py-1">
                  <option>Yearly</option>
                  <option>Monthly</option>
                  <option>Weekly</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">Activity chart will appear here</p>
                  <p className="text-sm text-slate-500 mt-2">Upload resumes to see analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <select className="bg-slate-700/50 border border-slate-600/50 text-white text-sm rounded px-2 py-1">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((resume, index) => (
                <div key={resume.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{resume.filename}</div>
                      <div className="text-xs text-slate-400">{new Date(resume.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        resume.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : resume.status === "processing"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-slate-500/20 text-slate-400"
                      }`}
                    >
                      {resume.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No activity yet</p>
              <p className="text-sm text-slate-500 mt-2">Start by uploading your first resume!</p>
              <Button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Upload Resume
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
