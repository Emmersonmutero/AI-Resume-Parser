import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, FileText, Target, Zap } from "lucide-react"

export default async function AIAssistantPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Resume Assistant
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Get AI-powered assistance to optimize your resume, create cover letters, and improve your job applications
          </p>
        </div>

        {/* AI Tools Tabs */}
        <Tabs defaultValue="optimize" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <TabsTrigger value="optimize" className="data-[state=active]:bg-purple-600">
              <Target className="h-4 w-4 mr-2" />
              Optimize Resume
            </TabsTrigger>
            <TabsTrigger value="cover-letter" className="data-[state=active]:bg-purple-600">
              <FileText className="h-4 w-4 mr-2" />
              Cover Letter
            </TabsTrigger>
            <TabsTrigger value="keywords" className="data-[state=active]:bg-purple-600">
              <Zap className="h-4 w-4 mr-2" />
              Keywords
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-600">
              <Brain className="h-4 w-4 mr-2" />
              Analysis
            </TabsTrigger>
          </TabsList>

          {/* Resume Optimization */}
          <TabsContent value="optimize" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Resume Optimization
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Paste your current resume content and target job description for AI optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Current Resume Content</label>
                    <Textarea
                      placeholder="Paste your current resume content here..."
                      className="min-h-[200px] bg-slate-900/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Target Job Description</label>
                    <Textarea
                      placeholder="Paste the job description you're targeting..."
                      className="min-h-[200px] bg-slate-900/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Brain className="h-4 w-4 mr-2" />
                  Optimize Resume with AI
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cover Letter Generator */}
          <TabsContent value="cover-letter" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  AI Cover Letter Generator
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Generate personalized cover letters based on your experience and target role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Google, Microsoft, Startup Inc."
                      className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Position Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Senior Software Engineer"
                      className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Key Requirements/Skills</label>
                  <Textarea
                    placeholder="List the key requirements from the job posting..."
                    className="min-h-[100px] bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Cover Letter
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keyword Analysis */}
          <TabsContent value="keywords" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  Keyword Optimization
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Analyze and optimize keywords to pass ATS systems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Job Description</label>
                  <Textarea
                    placeholder="Paste the job description to analyze keywords..."
                    className="min-h-[150px] bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Zap className="h-4 w-4 mr-2" />
                  Analyze Keywords
                </Button>

                {/* Sample Keywords Display */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Recommended Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {["React", "TypeScript", "Node.js", "AWS", "Docker", "Kubernetes", "GraphQL", "MongoDB"].map(
                      (keyword) => (
                        <Badge
                          key={keyword}
                          variant="secondary"
                          className="bg-purple-600/20 text-purple-300 border-purple-500/30"
                        >
                          {keyword}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resume Analysis */}
          <TabsContent value="analysis" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Resume Analysis & Scoring
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Get detailed feedback and scoring on your resume
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Upload or Paste Resume</label>
                  <Textarea
                    placeholder="Paste your resume content for analysis..."
                    className="min-h-[200px] bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze Resume
                </Button>

                {/* Sample Analysis Results */}
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <Card className="bg-slate-900/50 border-slate-600">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-300">Overall Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-400">85/100</div>
                      <p className="text-xs text-slate-400 mt-1">Above average</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900/50 border-slate-600">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-300">ATS Compatibility</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-yellow-400">78%</div>
                      <p className="text-xs text-slate-400 mt-1">Good compatibility</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
