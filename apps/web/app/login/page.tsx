import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
export const runtime = 'edge';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AuthForm from './AuthForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const supabase = createClient();
  
  // If user is already logged in, redirect to profile
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user || null;
  if (user) {
    return redirect('/profile');
  }

  return (
    <div className="min-h-screen bg-[#0A0B1A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background aesthetic */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-primary/25">
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-outfit font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Spielcade
            </span>
          </Link>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <AuthForm message={searchParams?.message} />
      </div>
    </div>
  );
}
