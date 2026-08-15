export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_type, page_path, game_id, session_id } = body

    if (!event_type) {
      return NextResponse.json({ error: 'event_type required' }, { status: 400 })
    }

    const validTypes = ['page_view', 'game_play', 'game_complete']
    if (!validTypes.includes(event_type)) {
      return NextResponse.json({ error: 'Invalid event_type' }, { status: 400 })
    }

    const supabase = createClient()

    // Optionally attach user if logged in
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('analytics_events').insert([{
      event_type,
      page_path: page_path || null,
      game_id: game_id || null,
      user_id: user?.id || null,
      session_id: session_id || null,
    }])

    if (error) {
      console.error('Analytics insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
