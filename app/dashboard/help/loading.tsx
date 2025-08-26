export default function HelpLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-slate-700/50 rounded w-1/4 mb-6 mx-auto"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-700/50 rounded"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-700/50 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
