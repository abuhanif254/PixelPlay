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

