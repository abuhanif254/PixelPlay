"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitContactForm(prevState: any, formData: FormData) {
  try {
    const supabase = createClient();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !subject || !message) {
      return { success: false, error: 'All fields are required.' };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        subject,
        message,
        status: 'unread'
      });

    if (error) {
      console.error('Error submitting contact form:', error);
      return { success: false, error: 'Failed to send message. Please try again later.' };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error in submitContactForm:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function submitBugReport(data: {
  gameSlug: string;
  gameTitle: string;
  category: string;
  description: string;
  sessionDurationSec: number;
  currentScore?: number;
  diagnostics: any;
}) {
  try {
    const supabase = createClient();
    const subject = `[Bug Report] ${data.gameTitle} (${data.category})`;
    const payload = {
      gameSlug: data.gameSlug,
      gameTitle: data.gameTitle,
      category: data.category,
      description: data.description,
      sessionDurationSec: data.sessionDurationSec,
      currentScore: data.currentScore || 0,
      diagnostics: data.diagnostics,
      timestamp: new Date().toISOString(),
    };

    const { error } = await supabase.from('contact_messages').insert({
      name: 'Player Diagnostic Telemetry',
      email: 'telemetry@spielcade.com',
      subject,
      message: JSON.stringify(payload, null, 2),
      status: 'unread',
    });

    if (error) {
      console.error('submitBugReport database error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('submitBugReport unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to submit bug report' };
  }
}


