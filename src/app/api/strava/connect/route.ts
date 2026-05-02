import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin
  const redirectUri = `${origin}/api/strava/callback`

  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'activity:read_all',
  })

  return Response.redirect(`https://www.strava.com/oauth/authorize?${params}`)
}
