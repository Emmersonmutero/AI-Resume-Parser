"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  HelpCircle,
  Book,
  MessageCircle,
  Mail,
  Phone,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Video,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
}

const faqs: FAQ[] = [
  {
    id: "1",
    question: "How do I upload and parse a resume?",
    answer:
      "Navigate to the Upload page, drag and drop your resume file (PDF, DOCX, or TXT), and click upload. The AI will automatically parse the resume and extract structured data within seconds.",
    category: "Getting Started",
    tags: ["upload", "parsing", "resume"],
  },
  {
    id: "2",
    question: "What file formats are supported?",
    answer:
      "We support PDF, DOCX (Microsoft Word), and TXT files. Files must be under 10MB in size for optimal processing.",
    category: "File Support",
    tags: ["formats", "pdf", "docx", "txt"],
  },
  {
    id: "3",
    question: "How accurate is the AI parsing?",
    answer:
      "Our AI parsing engine achieves 95%+ accuracy on well-formatted resumes. The system provides a confidence score for each parsed resume to help you assess data quality.",
    category: "AI & Parsing",
    tags: ["accuracy", "ai", "confidence"],
  },
  {
    id: "4",
    question: "Can I search for candidates by specific skills?",
    answer:
      "Yes! Use the Advanced Search feature to filter candidates by technical skills, soft skills, experience level, location, and more. You can also save frequently used searches.",
    category: "Search & Filtering",
    tags: ["search", "skills", "filtering"],
  },
  {
    id: "5",
    question: "How does job matching work?",
    answer:
      "Our AI analyzes job descriptions and candidate profiles to generate compatibility scores based on skills, experience, education, and location. Matches are ranked by relevance.",
    category: "Job Matching",
    tags: ["matching", "jobs", "scoring"],
  },
  {
    id: "6",
    question: "Is my data secure and private?",
    answer:
      "Yes, we use enterprise-grade security with encryption at rest and in transit. All data is stored securely and access is controlled through role-based permissions.",
    category: "Security & Privacy",
    tags: ["security", "privacy", "encryption"],
  },
]

const resources = [
  {
    title: "Getting Started Guide",
    description: "Complete walkthrough of the platform features",
    icon: <Book className="w-5 h-5" />,
    type: "Documentation",
    url: "#",
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step video guides for common tasks",
    icon: <Video className="w-5 h-5" />,
    type: "Video",
    url: "#",
  },
  {
    title: "API Documentation",
    description: "Technical documentation for developers",
    icon: <FileText className="w-5 h-5" />,
    type: "API",
    url: "#",
  },
  {
    title: "Best Practices",
    description: "Tips for optimal resume parsing results",
    icon: <Zap className="w-5 h-5" />,
    type: "Guide",
    url: "#",
  },
]

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const categories = ["All", ...Array.from(new Set(faqs.map((faq) => faq.category)))]

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // In a real app, this would send the contact form
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Message sent successfully! We'll get back to you soon.")
      setContactForm({ name: "", email: "", subject: "", message: "" })
    } catch (error) {
      toast.error("Failed to send message. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Help & Support</h1>
        <p className="text-slate-400">Find answers to common questions and get help with the platform</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:border-purple-500/30 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Live Chat</h3>
            <p className="text-sm text-slate-400">Get instant help from our support team</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:border-blue-500/30 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <Mail className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Email Support</h3>
            <p className="text-sm text-slate-400">Send us a detailed message</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:border-green-500/30 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <Phone className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Phone Support</h3>
            <p className="text-sm text-slate-400">Call us during business hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Resources */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Book className="w-5 h-5" />
            Documentation & Resources
          </CardTitle>
          <CardDescription className="text-slate-400">
            Helpful guides and documentation to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                <div className="text-purple-400">{resource.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{resource.title}</h4>
                  <p className="text-sm text-slate-400">{resource.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {resource.type}
                  </Badge>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription className="text-slate-400">Find quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600/50 text-white"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-700/50 border border-slate-600/50 text-white rounded-md px-3 py-2"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* FAQ List */}
          <div className="space-y-2">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="border border-slate-700/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{faq.question}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {faq.category}
                      </Badge>
                      {faq.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {expandedFAQ === faq.id ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                {expandedFAQ === faq.id && (
                  <div className="p-4 pt-0 border-t border-slate-700/50">
                    <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-8">
              <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No FAQs found matching your search</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Contact Support
          </CardTitle>
          <CardDescription className="text-slate-400">
            Can't find what you're looking for? Send us a message
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Name</label>
                <Input
                  value={contactForm.name}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600/50 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Email</label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600/50 text-white"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Subject</label>
              <Input
                value={contactForm.subject}
                onChange={(e) => setContactForm((prev) => ({ ...prev, subject: e.target.value }))}
                className="bg-slate-700/50 border-slate-600/50 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Message</label>
              <Textarea
                value={contactForm.message}
                onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                className="bg-slate-700/50 border-slate-600/50 text-white min-h-[120px]"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
