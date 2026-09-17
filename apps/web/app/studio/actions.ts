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

  // Any update to a game's build, source URL, or metadata queues it for moderation review.
  // Active games revert to 'pending' to prevent unvetted code injection (SEC-03).
  const isReModeration = existingGame.status === 'active'
  const nextStatus = 'pending'

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
    resubmitted_at: new Date().toISOString(),
    re_moderation: isReModeration ? true : undefined,
  }

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
    if (isReModeration) {
      revalidatePath('/admin/games/queue')
    }
  } catch (e) {
    console.error('revalidatePath error in updateDeveloperGame:', e)
  }
  return { success: true, reModeration: isReModeration }
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

  if (existingGame.status === 'active' || existingGame.status === 'pending') {
    return { success: false, error: 'Active or in-review games cannot be deleted directly. Please contact platform support.' }
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

export async function getDeveloperPayoutSettings() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized', data: null }

    const { data, error } = await supabase
      .from('developer_payout_profiles')
      .select('payout_method, payout_account, tax_certified, status, updated_at')
      .eq('developer_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('getDeveloperPayoutSettings database error:', error)
      return { success: false, error: error.message, data: null }
    }

    return {
      success: true,
      data: data ? {
        method: data.payout_method,
        account: data.payout_account,
        taxCertified: Boolean(data.tax_certified),
        status: data.status,
        updatedAt: data.updated_at
      } : null
    }
  } catch (err: any) {
    console.error('getDeveloperPayoutSettings unexpected error:', err)
    return { success: false, error: err?.message || 'Failed to retrieve payout settings', data: null }
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

    const cleanMethod = String(data.method || '').toLowerCase().trim()
    if (!['paypal', 'stripe', 'wire'].includes(cleanMethod)) {
      return { success: false, error: 'Invalid payout method selected.' }
    }

    const cleanAccount = String(data.account || '').trim()
    if (!cleanAccount || cleanAccount.length < 3 || cleanAccount.length > 255) {
      return { success: false, error: 'Please enter a valid payout account identifier.' }
    }

    const isTaxCertified = Boolean(data.taxCertified)

    const payload: {
      developer_id: string
      payout_method: string
      payout_account: string
      tax_certified: boolean
      tax_certified_at?: string
    } = {
      developer_id: user.id,
      payout_method: cleanMethod,
      payout_account: cleanAccount,
      tax_certified: isTaxCertified,
    }

    if (isTaxCertified) {
      payload.tax_certified_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('developer_payout_profiles')
      .upsert(payload, { onConflict: 'developer_id' })

    if (error) {
      console.error('saveDeveloperPayoutSettings database error:', error)
      return { success: false, error: error.message }
    }

    try {
      revalidatePath('/studio/revenue')
    } catch (revalError) {
      console.error('revalidatePath error in saveDeveloperPayoutSettings:', revalError)
    }

    return { success: true }
  } catch (err: any) {
    console.error('saveDeveloperPayoutSettings unexpected error:', err)
    return { success: false, error: err?.message || 'Failed to save payout settings' }
  }
}

