'use client';

import { useState } from 'react';
import { Github, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { login, signup, signInWithGithub, signInWithGoogle } from './actions';

export default function AuthForm({ message }: { message?: string }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState<'github' | 'google' | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    if (isSignUp) {
      // Validate passwords match
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        setIsLoading(false);
        return;
      }
      await signup(formData);
    } else {
      await login(formData);
    }
    
    setIsLoading(false);
  };

  const handleProviderAuth = async (provider: 'github' | 'google') => {
    setProviderLoading(provider);
    if (provider === 'github') {
      await signInWithGithub();
    } else {
      await signInWithGoogle();
    }
  };

  return (
    <div className="bg-[#111228]/80 backdrop-blur-xl py-8 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] sm:rounded-2xl sm:px-10 border border-white/5">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h3>
        <p className="text-sm text-gray-400">
          {isSignUp 
            ? 'Join Spielcade to save your high scores and favorites.' 
            : 'Sign in to access your saved games and settings.'}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email address
          </label>
          <div className="mt-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full rounded-xl border-0 bg-[#0A0B1A] py-3 pl-10 pr-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 placeholder:text-gray-600 transition-all"
              placeholder="player@spielcade.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <div className="mt-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="password"
              name="password"
              type={isSignUp ? "text" : "password"} // In real app, toggle visibility. For now just password.
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              className="block w-full rounded-xl border-0 bg-[#0A0B1A] py-3 pl-10 pr-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 placeholder:text-gray-600 transition-all"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
        </div>

        {isSignUp && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
              Confirm Password
            </label>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full rounded-xl border-0 bg-[#0A0B1A] py-3 pl-10 pr-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 placeholder:text-gray-600 transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>
        )}

        {message && (
          <div className="p-3 rounded-lg border border-danger/20 bg-danger/10 text-danger text-sm text-center">
            {message}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-lg shadow-primary/25 text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-[#111228] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        </span>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="ml-2 font-bold text-primary hover:text-accent transition-colors focus:outline-none"
        >
          {isSignUp ? 'Sign in instead' : 'Sign up now'}
        </button>
      </div>

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

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => handleProviderAuth('github')}
            disabled={!!providerLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-medium text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/20 focus:ring-offset-[#111228] transition-all disabled:opacity-50"
          >
            {providerLoading === 'github' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Github className="w-5 h-5" />}
            <span>GitHub</span>
          </button>

          <button
            onClick={() => handleProviderAuth('google')}
            disabled={!!providerLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-medium text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/20 focus:ring-offset-[#111228] transition-all disabled:opacity-50"
          >
            {providerLoading === 'google' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
