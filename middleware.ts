import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Skip middleware for API routes to avoid potential conflicts
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return response
    }

    // Skip middleware for static files and auth callback
    if (
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.startsWith('/auth/callback') ||
      request.nextUrl.pathname.includes('.')
    ) {
      return response
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Check if we have a session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // Define protected routes
    const isProtectedRoute = !request.nextUrl.pathname.startsWith('/auth/') && 
                            request.nextUrl.pathname !== '/'

    // If no user and trying to access protected route, redirect to login
    if (!user && isProtectedRoute && !error) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    // If user exists and trying to access auth pages, redirect to dashboard
    if (user && request.nextUrl.pathname.startsWith('/auth/')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard' // or wherever you want to redirect authenticated users
      return NextResponse.redirect(url)
    }

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    
    // For auth routes and home page, allow access even if middleware fails
    if (
      request.nextUrl.pathname.startsWith('/auth/') || 
      request.nextUrl.pathname === '/' ||
      request.nextUrl.pathname.startsWith('/api/')
    ) {
      return NextResponse.next()
    }

    // For other routes, redirect to login on middleware failure
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - api routes (some are handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
