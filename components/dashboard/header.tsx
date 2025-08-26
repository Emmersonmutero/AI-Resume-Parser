"use client"

import { Search, Bell, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface HeaderProps {
  user: any
  profile: any
}

export function Header({ user, profile }: HeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="bg-slate-900/30 backdrop-blur-xl border-b border-slate-700/50 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 max-w-xs md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search Here"
              className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-purple-500/50 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm text-slate-300">Welcome! {profile?.full_name || user.email?.split("@")[0]}</span>
            <span className="text-xs text-slate-500 hidden lg:block">Security is a process, not a product</span>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800/50 p-2">
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800/50 p-2">
              <Bell className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2 md:space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 hidden sm:flex"
            >
              Log Out
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 sm:hidden text-xs px-2"
            >
              Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
