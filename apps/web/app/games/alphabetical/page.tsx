import { redirect } from 'next/navigation';

export const runtime = 'edge';

export default function AlphabeticalIndexPage() {
  redirect('/games/alphabetical/a');
}
