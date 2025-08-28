import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { hasPermission } from "@/lib/permissions"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const canReadUsers = await hasPermission(user.id, "users:read")
    if (!canReadUsers) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { query, filters, timestamp } = await request.json()

    // Store search log
    const { error } = await supabase.from("search_logs").insert({
      user_id: user.id,
      search_query: query,
      search_filters: filters,
      search_timestamp: timestamp,
      results_count: 0, // Will be updated by the search function
    })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Search log error:", error)
    return NextResponse.json({ error: "Failed to log search" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const canReadUsers = await hasPermission(user.id, "users:read")
    if (!canReadUsers) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get search analytics
    const { data: searchLogs, error } = await supabase
      .from("search_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("search_timestamp", { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    // Aggregate popular searches
    const popularQueries = searchLogs
      .reduce((acc: any[], log) => {
        const existing = acc.find((item) => item.query === log.search_query)
        if (existing) {
          existing.count++
        } else {
          acc.push({ query: log.search_query, count: 1 })
        }
        return acc
      }, [])
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      recentSearches: searchLogs.slice(0, 10),
      popularQueries,
      totalSearches: searchLogs.length,
    })
  } catch (error) {
    console.error("Get search logs error:", error)
    return NextResponse.json({ error: "Failed to get search logs" }, { status: 500 })
  }
}
