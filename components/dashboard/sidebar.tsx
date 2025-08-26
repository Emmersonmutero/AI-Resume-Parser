"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Upload,
  Users,
  Search,
  Briefcase,
  BarChart3,
  Settings,
  HelpCircle,
  FileText,
  Menu,
  X,
  Brain,
  ClipboardList,
} from "lucide-react"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Upload", href: "/dashboard/upload", icon: Upload },
  { name: "AI Assistant", href: "/dashboard/ai-assistant", icon: Brain },
  { name: "Applications", href: "/dashboard/applications", icon: ClipboardList },
  { name: "Candidates", href: "/dashboard/candidates", icon: Users },
  { name: "Search", href: "/dashboard/search", icon: Search },
  { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
]

const settings = [
  { name: "Profile", href: "/dashboard/profile", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help & Support", href: "/dashboard/help", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-700/50"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          "fixed inset-y-0 left-0 z-50",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ResumeAI</span>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">General</div>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          <div className="mt-8 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Settings</div>
            {settings.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="p-4">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">✨</span>
              </div>
              <span className="text-sm font-semibold text-white">Upgrade</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Additional features to enhance your parsing</p>
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium py-2 px-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
              Upgrade →
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
