import type { Metadata } from 'next';
import { cacheLife } from 'next/cache';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getResourcesContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Resources | Lowell Is Queer',
  description: 'Local LGBTQIA+ resources in and around Lowell, MA',
};

export default async function ResourcesPage() {
  'use cache';
  cacheLife('max');

  const resourcesSource = await getResourcesContent();

  return (
    <div className="mx-auto max-w-[800px] px-8 py-16">
      <h1 className="mb-10 font-heading text-3xl font-black tracking-tight">Resources</h1>

      <section>
        <div className="prose-content prose-a:no-underline hover:prose-a:underline">
          <MDXRemote source={resourcesSource} />
        </div>
      </section>
    </div>
  );
}
