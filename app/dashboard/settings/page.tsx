"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Shield, Database, Download, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface UserProfile {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
  company?: string
  department?: string
  phone?: string
  location?: string
  linkedin_url?: string
  website_url?: string
  professional_summary?: string
}

interface Settings {
  notifications: {
    email: boolean
    push: boolean
    parsing: boolean
    matches: boolean
  }
  privacy: {
    profileVisible: boolean
    dataSharing: boolean
    analytics: boolean
  }
  preferences: {
    theme: string
    language: string
    timezone: string
  }
}

const roleConfig = {
  super_admin: {
    name: "Super Admin",
    description: "Has all permissions. Can manage users and system settings.",
  },
  recruiter: {
    name: "Recruiter",
    description: "Can view and manage candidates, jobs, and applications.",
  },
  hiring_manager: {
    name: "Hiring Manager",
    description: "Can view candidates and jobs, and manage applications for their own jobs.",
  },
  candidate: {
    name: "Candidate",
    description: "Can view their own profile and applications.",
  },
  interviewer: {
    name: "Interviewer",
    description: "Can view candidate profiles for interviews they are assigned to.",
  },
  sourcing_specialist: {
    name: "Sourcing Specialist",
    description: "Can search for and add new candidates to the system.",
  },
  recruiting_coordinator: {
    name: "Recruiting Coordinator",
    description: "Can schedule interviews and manage interview logistics.",
  },
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      push: false,
      parsing: true,
      matches: true,
    },
    privacy: {
      profileVisible: true,
      dataSharing: false,
      analytics: true,
    },
    preferences: {
      theme: "dark",
      language: "en",
      timezone: "UTC",
    },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchProfile()
    loadSettings()
  }, [])

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = () => {
    const savedSettings = localStorage.getItem("userSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      localStorage.setItem("userSettings", JSON.stringify(settings))
      toast.success("Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return

    try {
      const { error } = await supabase.from("profiles").update(updates).eq("id", profile.id)

      if (error) throw error

      setProfile({ ...profile, ...updates })
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch("/api/export?type=user-data")
      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `user-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Data exported successfully")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export data")
    }
  }

  const deleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    try {
      // In a real app, this would call a secure API endpoint
      toast.error("Account deletion is not implemented in this demo")
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error("Failed to delete account")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700/50 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account settings and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-slate-400">
            Update your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={profile?.full_name || ""}
                onChange={(e) => setProfile((prev) => (prev ? { ...prev, full_name: e.target.value } : null))}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ""}
                onChange={(e) => setProfile((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">
                Phone
              </Label>
              <Input
                id="phone"
                value={profile?.phone || ""}
                onChange={(e) => setProfile((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-white">
                Location
              </Label>
              <Input
                id="location"
                value={profile?.location || ""}
                onChange={(e) => setProfile((prev) => (prev ? { ...prev, location: e.target.value } : null))}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-white">
                Company
              </Label>
              <Input
                id="company"
                value={profile?.company || ""}
                onChange={(e) => setProfile((prev) => (prev ? { ...prev, company: e.target.value } : null))}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-white">
                Department
              </Label>
              <Input
                id="department"
                value={profile?.department || ""}
                onChange={(e) => setProfile((prev) => (prev ? { ...prev, department: e.target.value } : null))}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url" className="text-white">
                LinkedIn URL
              </Label>
              <Input
                id="linkedin_url"
                value={profile?.linkedin_url || ""}
                onChange={(e) => setProfile((prev) => (prev ? { ...prev, linkedin_url: e.target.value } : null))}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_url" className="text-white">
                Website URL
              </Label>
              <Input
                id="website_url"
                value={profile?.website_url || ""}
                onChange={(e) => setProfile((prev) => (prev ? { ...prev, website_url: e.target.value } : null))}
                className="bg-slate-700/50 border-slate-600/50 text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="professional_summary" className="text-white">
              Professional Summary
            </Label>
            <Textarea
              id="professional_summary"
              value={profile?.professional_summary || ""}
              onChange={(e) =>
                setProfile((prev) => (prev ? { ...prev, professional_summary: e.target.value } : null))
              }
              className="bg-slate-700/50 border-slate-600/50 text-white"
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-white">
              Role
            </Label>
            <select
              id="role"
              value={profile?.role || ""}
              onChange={(e) => setProfile((prev) => (prev ? { ...prev, role: e.target.value } : null))}
              className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-md px-3 py-2"
            >
              {Object.entries(roleConfig).map(([roleId, { name }]) => (
                <option key={roleId} value={roleId}>
                  {name}
                </option>
              ))}
            </select>
            {profile?.role && (
              <p className="text-sm text-slate-400">
                {roleConfig[profile.role as keyof typeof roleConfig]?.description}
              </p>
            )}
          </div>
          <Button
            onClick={() =>
              profile &&
              updateProfile({
                full_name: profile.full_name,
                email: profile.email,
                role: profile.role,
                company: profile.company,
                department: profile.department,
                phone: profile.phone,
                location: profile.location,
                linkedin_url: profile.linkedin_url,
                website_url: profile.website_url,
                professional_summary: profile.professional_summary,
              })
            }
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Update Profile
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription className="text-slate-400">Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Email Notifications</Label>
              <p className="text-sm text-slate-400">Receive notifications via email</p>
            </div>
            <Switch
              checked={settings.notifications.email}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, email: checked },
                }))
              }
            />
          </div>
          <Separator className="bg-slate-700/50" />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Parsing Notifications</Label>
              <p className="text-sm text-slate-400">Get notified when resume parsing completes</p>
            </div>
            <Switch
              checked={settings.notifications.parsing}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, parsing: checked },
                }))
              }
            />
          </div>
          <Separator className="bg-slate-700/50" />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Match Notifications</Label>
              <p className="text-sm text-slate-400">Get notified about new candidate matches</p>
            </div>
            <Switch
              checked={settings.notifications.matches}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, matches: checked },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription className="text-slate-400">
            Control your privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Profile Visibility</Label>
              <p className="text-sm text-slate-400">Make your profile visible to other users</p>
            </div>
            <Switch
              checked={settings.privacy.profileVisible}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  privacy: { ...prev.privacy, profileVisible: checked },
                }))
              }
            />
          </div>
          <Separator className="bg-slate-700/50" />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Analytics Data</Label>
              <p className="text-sm text-slate-400">Allow usage analytics to improve the service</p>
            </div>
            <Switch
              checked={settings.privacy.analytics}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  privacy: { ...prev.privacy, analytics: checked },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </CardTitle>
          <CardDescription className="text-slate-400">Export or delete your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Export Data</Label>
              <p className="text-sm text-slate-400">Download all your data in JSON format</p>
            </div>
            <Button
              variant="outline"
              onClick={exportData}
              className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <Separator className="bg-slate-700/50" />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-red-400">Delete Account</Label>
              <p className="text-sm text-slate-400">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" onClick={deleteAccount} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={saving}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  )
}
