'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitPlugin(data: {
  title: string
  description: string
  category: string
  image_url: string
  source_url: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  // Generate a basic slug
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 10000)

  const payload = {
    title: data.title,
    slug,
    description: data.description,
    category: data.category,
    image_url: data.image_url,
    source_url: data.source_url,
    developer_id: user.id,
    status: 'pending' // Automatically set to pending for review
  }

  const { error } = await supabase.from('games').insert([payload])

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/studio')
  return { success: true }
}
