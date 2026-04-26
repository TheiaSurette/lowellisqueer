import type { Metadata } from 'next';
import { cacheLife } from 'next/cache';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getMeetupsContent, getMeetups } from '@/lib/content';
import { MeetupWithDialog } from '@/components/meetup-dialog';
import type { Meetup } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Meetups | Lowell Is Queer',
  description: 'Local LGBTQIA+ meetup groups in and around Lowell, MA',
};

function groupBySection(meetups: Meetup[]): [string, Meetup[]][] {
  const groups = new Map<string, Meetup[]>();
  for (const meetup of meetups) {
    const group = groups.get(meetup.section);
    if (group) group.push(meetup);
    else groups.set(meetup.section, [meetup]);
  }
  return Array.from(groups.entries());
}

export default async function MeetupsPage() {
  'use cache';
  cacheLife('max');

  const [meetupsSource, meetups] = await Promise.all([
    getMeetupsContent(),
    getMeetups(),
  ]);

  const sections = groupBySection(meetups);

  return (
    <div className="mx-auto max-w-[800px] px-8 py-16">
      <h1 className="mb-10 font-heading text-3xl font-black tracking-tight">Meetups</h1>

      <section className="mb-14">
        <div className="prose-content prose-a:no-underline hover:prose-a:underline">
          <MDXRemote source={meetupsSource} />
        </div>
      </section>

      {sections.map(([section, sectionMeetups], sectionIndex) => (
        <section key={section} className="mb-14 last:mb-0">
          <h2 className="mb-6 font-heading text-2xl font-bold">{section}</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {sectionMeetups.map((meetup, i) => (
              <MeetupWithDialog
                key={meetup.name}
                meetup={meetup}
                index={sectionIndex * 2 + i}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
