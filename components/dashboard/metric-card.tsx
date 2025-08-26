import type React from "react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  percentage?: string
  color: "red" | "purple" | "pink" | "blue" | "cyan"
  icon?: React.ReactNode
  className?: string
}

const colorClasses = {
  red: "from-red-500 to-red-600",
  purple: "from-purple-500 to-purple-600",
  pink: "from-pink-500 to-pink-600",
  blue: "from-blue-500 to-blue-600",
  cyan: "from-cyan-500 to-cyan-600",
}

const bgColorClasses = {
  red: "bg-red-500/20",
  purple: "bg-purple-500/20",
  pink: "bg-pink-500/20",
  blue: "bg-blue-500/20",
  cyan: "bg-cyan-500/20",
}

export function MetricCard({ title, value, percentage, color, icon, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 relative overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", bgColorClasses[color])}>
          {icon}
        </div>
        <button className="text-slate-400 hover:text-white">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-3xl font-bold text-white">{value}</div>
        <div className="text-sm text-slate-400">{title}</div>
        {percentage && <div className="text-xs text-slate-500">{percentage}</div>}
      </div>

      {/* Gradient overlay */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 pointer-events-none", colorClasses[color])} />
    </div>
  )
}
