"use client"

interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  className?: string
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  color = "#8b5cf6",
  label,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgb(51 65 85 / 0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{value}</span>
        {label && <span className="text-xs text-slate-400 mt-1">{label}</span>}
      </div>
    </div>
  )
}
