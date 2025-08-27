"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSent, setIsSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setIsSent(false)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setIsSent(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(139, 69, 19, 0.3) 0%, rgba(75, 0, 130, 0.4) 50%, rgba(255, 20, 147, 0.3) 100%), url('/mountain-landscape-sunset-pink-purple-sky.png')`,
        }}
      />

      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-white mb-2">Forgot Password</h1>
            </div>

            {isSent ? (
              <div className="text-center text-white">
                <p>A password reset link has been sent to your email address.</p>
                <p>Please check your inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white/40 focus:ring-white/20"
                  />
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-200 bg-red-500/20 border border-red-400/30 rounded-md backdrop-blur-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium rounded-md border-0"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}

            <div className="flex justify-center items-center mt-6 text-sm">
              <Link href="/auth/login" className="text-white/80 hover:text-white">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
