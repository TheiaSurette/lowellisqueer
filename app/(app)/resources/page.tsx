import type { Metadata } from 'next';
import { cacheLife } from 'next/cache';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getResourcesContent, getResources } from '@/lib/content';
import { ResourceCard } from '@/components/resource-card';

export const metadata: Metadata = {
  title: 'Resources | Lowell Is Queer',
  description: 'Local LGBTQIA+ resources in and around Lowell, MA',
};

export default async function ResourcesPage() {
  'use cache';
  cacheLife('max');

  const [resourcesSource, resources] = await Promise.all([
    getResourcesContent(),
    getResources(),
  ]);

  return (
    <div className="mx-auto max-w-[800px] px-8 py-16">
      <h1 className="mb-10 font-heading text-3xl font-black tracking-tight">Resources</h1>

      <section>
        <div className="prose-content prose-a:no-underline hover:prose-a:underline">
          <MDXRemote source={resourcesSource} />
        </div>
      </section>

      <section>
        <div>
          {resources.map((resource, i) => (
            <ResourceCard key={resource.name} resource={resource} />
          ))}
        </div>
      </section>
    </div>
  );
}
