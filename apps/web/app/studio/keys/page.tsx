import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import KeysClient from './KeysClient';

export const runtime = 'edge';
export const revalidate = 0;

export default async function ApiKeysPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user || null;

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch developer's API keys
  const { data: keys } = await supabase
    .from('api_keys')
    .select('*')
    .eq('developer_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-[#111228] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl">
        <h2 className="text-xl font-bold font-outfit text-gray-900 dark:text-white mb-2">API Keys</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Manage your Master API key to authenticate your games with the Spielcade SDK. 
          You can only have 1 active Master Key at a time.
        </p>
        
        <KeysClient keys={keys || []} />
      </div>
    </div>
  );
}
