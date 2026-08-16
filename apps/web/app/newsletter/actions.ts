"use server";

import { createClient } from '@/lib/supabase/server';

export async function subscribeToNewsletter(prevState: any, formData: FormData) {
  try {
    const supabase = createClient();
    
    const email = formData.get('email') as string;

    if (!email) {
      return { success: false, error: 'Email address is required.' };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Insert into database
    // We rely on the UNIQUE constraint on the email column to prevent duplicates
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email });

    if (error) {
      // Postgres error code for unique violation is 23505
      if (error.code === '23505') {
        return { success: false, error: 'You are already subscribed to the newsletter!' };
      }
      console.error('Error subscribing to newsletter:', error);
      return { success: false, error: 'Failed to subscribe. Please try again later.' };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error in subscribeToNewsletter:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

