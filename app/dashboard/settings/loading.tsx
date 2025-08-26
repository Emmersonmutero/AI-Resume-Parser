export default function SettingsLoading() {
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
