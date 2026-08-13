import { redirect } from 'next/navigation';

export const runtime = 'edge';

export default function CategoriesIndexPage() {
  // Redirect the base /categories route to a default category
  // In a real app, this might be an index page of all categories
  redirect('/categories/puzzle-games');
}
