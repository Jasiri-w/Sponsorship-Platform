import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  // For now, we'll handle authentication client-side through the AuthProvider
  // This middleware can be enhanced later with server-side auth checks
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}