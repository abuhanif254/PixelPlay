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

export async function generateApiKey() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Unauthorized' }

  // Enforce 1 Master Key limitation
  const { data: existingKeys } = await supabase.from('api_keys').select('id').eq('developer_id', user.id)
  if (existingKeys && existingKeys.length > 0) {
    return { success: false, error: 'You already have an active API key. Revoke it first to generate a new one.' }
  }

  // Generate random API key
  // Using basic Math.random to avoid importing Node crypto if it causes edge issues, 
  // but let's use Web Crypto API which works in Edge and Node
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

  revalidatePath('/studio/keys')
  // We return the raw key ONLY ONCE
  return { success: true, key: apiKey }
}

export async function revokeApiKey(id: string) {
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

  revalidatePath('/studio/keys')
  return { success: true }
}

