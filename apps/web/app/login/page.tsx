import Link from 'next/link';
import { Gamepad2, ArrowRight, Github } from 'lucide-react';
import { login, signup } from './actions';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const supabase = createClient();
  
  // If user is already logged in, redirect to profile
  const { data: { user } } = await supabase.auth.getUser();
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
              PixelPlay
            </span>
          </Link>
        </div>
        <h2 className="mt-8 text-center text-3xl font-outfit font-bold tracking-tight text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Sign in to save your games, favorites, and high scores.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#111228]/80 backdrop-blur-xl py-8 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] sm:rounded-2xl sm:px-10 border border-white/5">
          <form className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-xl border-0 bg-[#0A0B1A] py-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 placeholder:text-gray-600 transition-all"
                  placeholder="player@pixelplay.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-xl border-0 bg-[#0A0B1A] py-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 placeholder:text-gray-600 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {searchParams?.message && (
              <p className="text-sm text-center text-danger bg-danger/10 p-3 rounded-lg border border-danger/20">
                {searchParams.message}
              </p>
            )}

            <div className="flex items-center space-x-4 pt-2">
              <button
                formAction={login}
                className="flex-1 flex justify-center py-3 px-4 rounded-xl shadow-lg shadow-primary/25 text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-[#111228] transition-all transform hover:-translate-y-0.5"
              >
                Sign in
              </button>
              <button
                formAction={signup}
                className="flex-1 flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/20 focus:ring-offset-[#111228] transition-all"
              >
                Sign up
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#111228] px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {}}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-medium text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/20 focus:ring-offset-[#111228] transition-all"
              >
                <Github className="w-5 h-5" />
                <span>GitHub (Coming Soon)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
