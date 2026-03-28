import { redirect } from 'next/navigation';

export default function LegacySearchRedirect({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim();
  if (q) {
    redirect(`/site-search?q=${encodeURIComponent(q)}`);
  }
  redirect('/site-search');
}
