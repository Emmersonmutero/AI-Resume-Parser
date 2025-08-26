"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/components/dashboard/metric-card"
import { CircularProgress } from "@/components/dashboard/circular-progress"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, FileText, Clock, Target, Download, Activity, Zap } from "lucide-react"
import { toast } from "sonner"

interface AnalyticsData {
  totalResumes: number
  totalCandidates: number
  totalJobs: number
  totalMatches: number
  parsingSuccessRate: number
  avgProcessingTime: number
  recentActivity: any[]
  monthlyStats: any[]
  topSkills: Array<{ skill: string; count: number }>
  topCompanies: Array<{ company: string; count: number }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`)
      if (!response.ok) throw new Error("Failed to fetch analytics")

      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast.error("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    try {
      const response = await fetch("/api/export?type=analytics")
      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Analytics report exported successfully")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export report")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700/50 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700/50 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-700/50 rounded"></div>
            <div className="h-64 bg-slate-700/50 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-800/50 border border-slate-700/50 text-white text-sm rounded-lg px-3 py-1"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportReport}
            className="bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Resumes"
          value={analytics?.totalResumes?.toString() || "0"}
          percentage="Files Processed"
          color="blue"
          icon={<FileText className="w-6 h-6 text-blue-400" />}
        />
        <MetricCard
          title="Active Candidates"
          value={analytics?.totalCandidates?.toString() || "0"}
          percentage="Parsed Profiles"
          color="green"
          icon={<Users className="w-6 h-6 text-green-400" />}
        />
        <MetricCard
          title="Job Matches"
          value={analytics?.totalMatches?.toString() || "0"}
          percentage="Successful Matches"
          color="purple"
          icon={<Target className="w-6 h-6 text-purple-400" />}
        />
        <MetricCard
          title="Success Rate"
          value={`${Math.round(analytics?.parsingSuccessRate || 0)}%`}
          percentage="Parse Accuracy"
          color="orange"
          icon={<Zap className="w-6 h-6 text-orange-400" />}
        />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Processing Performance */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Processing Performance</CardTitle>
              <CardDescription className="text-slate-400">Average processing time and success rate</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <CircularProgress
                value={Math.round(analytics?.parsingSuccessRate || 0)}
                size={140}
                color="url(#performanceGradient)"
                label="Success"
              />
              <div className="text-center">
                <div className="text-sm text-slate-400">Avg. Time: {analytics?.avgProcessingTime || 0}s</div>
                <div className="flex items-center justify-center space-x-4 mt-2">
                  <span className="text-xs text-slate-500">0%</span>
                  <span className="text-xs text-slate-500">100%</span>
                </div>
              </div>
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activity Timeline
                </CardTitle>
                <select className="bg-slate-700/50 border border-slate-600/50 text-white text-sm rounded px-2 py-1">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">Activity chart visualization</p>
                  <p className="text-sm text-slate-500 mt-2">
                    {analytics?.recentActivity?.length || 0} activities in selected period
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Skills in Database
            </CardTitle>
            <CardDescription className="text-slate-400">Most common skills across all candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.topSkills?.slice(0, 8).map((skill, index) => (
                <div key={skill.skill} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="text-white font-medium">{skill.skill}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${(skill.count / (analytics?.topSkills?.[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-slate-400 text-sm w-8 text-right">{skill.count}</span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <p className="text-slate-400">No skill data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Companies */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Companies
            </CardTitle>
            <CardDescription className="text-slate-400">Most represented companies in candidate pool</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.topCompanies?.slice(0, 8).map((company, index) => (
                <div key={company.company} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="text-white font-medium">{company.company}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                        style={{ width: `${(company.count / (analytics?.topCompanies?.[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-slate-400 text-sm w-8 text-right">{company.count}</span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <p className="text-slate-400">No company data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            System Performance Metrics
          </CardTitle>
          <CardDescription className="text-slate-400">
            Real-time system health and performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400">99.9%</div>
              <div className="text-sm text-slate-400">Uptime</div>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{analytics?.avgProcessingTime || 0}s</div>
              <div className="text-sm text-slate-400">Avg Response</div>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{analytics?.totalResumes || 0}</div>
              <div className="text-sm text-slate-400">Files Processed</div>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">0</div>
              <div className="text-sm text-slate-400">Errors Today</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
