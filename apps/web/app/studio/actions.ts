'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SubmitPluginInput {
  title: string
  description: string
  category: string
  image_url: string
  source_url: string
  aspectRatio?: '16:9' | '4:3' | '9:16' | 'auto'
  orientation?: 'landscape' | 'portrait'
  controls?: string[]
  tags?: string[]
  authorName?: string
}

export async function submitPlugin(data: SubmitPluginInput) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  // Generate a basic slug
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 10000)

  const metadata = {
    aspectRatio: data.aspectRatio || '16:9',
    orientation: data.orientation || 'landscape',
    controls: data.controls || ['Keyboard', 'Mouse'],
    tags: data.tags || [],
    developer: data.authorName || undefined,
    submitted_at: new Date().toISOString()
  }

  const payload = {
    title: data.title,
    slug,
    description: data.description,
    category: data.category,
    image_url: data.image_url,
    source_url: data.source_url,
    developer_id: user.id,
    metadata,
    status: 'pending' // Automatically set to pending for review
  }

  const { error } = await supabase.from('games').insert([payload])

  if (error) {
    return { success: false, error: error.message }
  }

  try {
    revalidatePath('/studio')
  } catch (e) {
    console.error('revalidatePath error in submitPlugin:', e)
  }
  return { success: true }
}

export async function updateDeveloperGame(
  gameId: string, 
  data: SubmitPluginInput
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  // Verify ownership
  const { data: existingGame, error: fetchErr } = await supabase
    .from('games')
    .select('id, developer_id, metadata, status')
    .eq('id', gameId)
    .maybeSingle()

  if (fetchErr || !existingGame) {
    return { success: false, error: 'Game not found.' }
  }

  if (existingGame.developer_id !== user.id) {
    return { success: false, error: 'Unauthorized. You do not own this game.' }
  }

  const currentMeta = (existingGame.metadata as any) || {}
  const updatedMeta = {
    ...currentMeta,
    aspectRatio: data.aspectRatio || currentMeta.aspectRatio || '16:9',
    orientation: data.orientation || currentMeta.orientation || 'landscape',
    controls: data.controls || currentMeta.controls || ['Keyboard', 'Mouse'],
    tags: data.tags || currentMeta.tags || [],
    developer: data.authorName || currentMeta.developer,
    updated_at: new Date().toISOString(),
    // Clear previous rejection reason upon resubmission
    rejection_reason: null,
    resubmitted_at: new Date().toISOString()
  }

  // If game was rejected or draft, automatically move back to pending for review
  const nextStatus = existingGame.status === 'rejected' ? 'pending' : existingGame.status

  const { error } = await supabase
    .from('games')
    .update({
      title: data.title,
      description: data.description,
      category: data.category,
      image_url: data.image_url,
      source_url: data.source_url,
      metadata: updatedMeta,
      status: nextStatus
    })
    .eq('id', gameId)

  if (error) {
    return { success: false, error: error.message }
  }

  try {
    revalidatePath('/studio')
  } catch (e) {
    console.error('revalidatePath error in updateDeveloperGame:', e)
  }
  return { success: true }
}

export async function deleteDeveloperGame(gameId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  // Only allow deleting draft or rejected games
  const { data: existingGame, error: fetchErr } = await supabase
    .from('games')
    .select('id, developer_id, status')
    .eq('id', gameId)
    .maybeSingle()

  if (fetchErr || !existingGame) {
    return { success: false, error: 'Game not found.' }
  }

  if (existingGame.developer_id !== user.id) {
    return { success: false, error: 'Unauthorized. You do not own this game.' }
  }

  if (existingGame.status === 'active') {
    return { success: false, error: 'Active games cannot be deleted directly. Please contact support.' }
  }

  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', gameId)

  if (error) {
    return { success: false, error: error.message }
  }

  try {
    revalidatePath('/studio')
  } catch (e) {
    console.error('revalidatePath error in deleteDeveloperGame:', e)
  }
  return { success: true }
}

export async function generateApiKey() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Enforce 1 Master Key limitation
    const { data: existingKeys } = await supabase.from('api_keys').select('id').eq('developer_id', user.id)
    if (existingKeys && existingKeys.length > 0) {
      return { success: false, error: 'You already have an active API key. Revoke it first to generate a new one.' }
    }

    // Generate random API key
    const array = new Uint8Array(32);
    globalThis.crypto.getRandomValues(array);
    const rawKey = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    const apiKey = `sp_live_${rawKey}`;
    
    // Create a simple hash to store (SHA-256)
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const { error } = await supabase.from('api_keys').insert([{
      developer_id: user.id,
      key_hash: keyHash
    }])

    if (error) {
      return { success: false, error: error.message }
    }

    try {
      revalidatePath('/studio/keys')
    } catch (revalError) {
      console.error('revalidatePath error in generateApiKey:', revalError)
    }

    // We return the raw key ONLY ONCE
    return { success: true, key: apiKey }
  } catch (err: any) {
    console.error('Unhandled error in generateApiKey:', err)
    return { success: false, error: err?.message || String(err) }
  }
}

export async function revokeApiKey(id: string) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('developer_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    try {
      revalidatePath('/studio/keys')
    } catch (revalError) {
      console.error('revalidatePath error in revokeApiKey:', revalError)
    }
    
    return { success: true }
  } catch (err: any) {
    console.error('Unhandled error in revokeApiKey:', err)
    return { success: false, error: err?.message || String(err) }
  }
}

export async function saveDeveloperPayoutSettings(data: {
  method: string
  account: string
  taxCertified: boolean
}) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase.from('contact_messages').insert({
      name: `Developer Payout Configuration`,
      email: user.email || 'developer@spielcade.com',
      subject: `[Payout Settings] Developer ${user.id}`,
      message: JSON.stringify({
        userId: user.id,
        method: data.method,
        account: data.account,
        taxCertified: data.taxCertified,
        updatedAt: new Date().toISOString()
      }, null, 2),
      status: 'unread'
    })

    if (error) {
      console.error('saveDeveloperPayoutSettings database error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('saveDeveloperPayoutSettings unexpected error:', err)
    return { success: false, error: err?.message || 'Failed to save payout settings' }
  }
}
