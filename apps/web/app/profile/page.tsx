import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LogOut, User, Gamepad2, Settings, Trophy } from 'lucide-react';
import Link from 'next/link';
import { logout } from './actions';

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Placeholder for user games fetch from Supabase
  const savedGames: any[] = [];
  
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0B1A] pt-12 pb-24 text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg shadow-primary/20 border-4 border-[#111228]">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-outfit font-extrabold tracking-tight">
                Player Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {user.email}
              </p>
            </div>
          </div>
          
          <div className="mt-6 md:mt-0 flex items-center space-x-4">
            <button className="flex items-center space-x-2 bg-gray-100 dark:bg-[#111228] px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/5 transition-colors border border-transparent dark:border-white/5">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <form action={logout}>
              <button className="flex items-center space-x-2 bg-danger/10 text-danger px-4 py-2 rounded-xl text-sm font-medium hover:bg-danger/20 transition-colors border border-danger/20">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-gray-50 dark:bg-[#111228]/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5">
              <h2 className="text-2xl font-outfit font-bold mb-6 flex items-center">
                <Gamepad2 className="w-6 h-6 mr-3 text-primary" />
                Recent Games
              </h2>
              {savedGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedGames.map((game, i) => (
                    <div key={i} className="bg-white dark:bg-[#0A0B1A] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center space-x-4">
                       {/* Mock Game Card */}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-[#0A0B1A] rounded-2xl border border-gray-100 dark:border-white/5">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No recent games found.</p>
                  <Link href="/" className="inline-flex items-center space-x-2 text-primary font-bold hover:text-accent transition-colors">
                    <span>Explore Games</span>
                  </Link>
                </div>
              )}
            </section>
          </div>
          
          <div className="space-y-8">
            <section className="bg-gray-50 dark:bg-[#111228]/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5">
              <h2 className="text-2xl font-outfit font-bold mb-6 flex items-center">
                <Trophy className="w-6 h-6 mr-3 text-accent" />
                Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white dark:bg-[#0A0B1A] rounded-xl border border-gray-100 dark:border-white/5">
                  <span className="text-gray-500 dark:text-gray-400">Games Played</span>
                  <span className="font-bold text-lg">0</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white dark:bg-[#0A0B1A] rounded-xl border border-gray-100 dark:border-white/5">
                  <span className="text-gray-500 dark:text-gray-400">Total Playtime</span>
                  <span className="font-bold text-lg">0h</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white dark:bg-[#0A0B1A] rounded-xl border border-gray-100 dark:border-white/5">
                  <span className="text-gray-500 dark:text-gray-400">Achievements</span>
                  <span className="font-bold text-lg">0/100</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
