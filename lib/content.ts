import fs from 'fs/promises';
import path from 'path';
import type { Meetup, SocialLink } from './types';

const contentDir = path.join(process.cwd(), 'content');

export async function getAboutContent(): Promise<string> {
  return fs.readFile(path.join(contentDir, 'about.mdx'), 'utf-8');
}

export async function getResourcesContent(): Promise<string> {
  return fs.readFile(path.join(contentDir, 'resources.mdx'), 'utf-8');
}

export async function getGuidelines(): Promise<string[]> {
  const raw = await fs.readFile(path.join(contentDir, 'guidelines.json'), 'utf-8');
  return JSON.parse(raw) as string[];
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  const raw = await fs.readFile(path.join(contentDir, 'social-links.json'), 'utf-8');
  return JSON.parse(raw) as SocialLink[];
}

export async function getMeetupsContent(): Promise<string> {
  return fs.readFile(path.join(contentDir, 'meetups.mdx'), 'utf-8');
}

export async function getMeetups(): Promise<Meetup[]> {
  const raw = await fs.readFile(path.join(contentDir, 'meetups.json'), 'utf-8');
  return JSON.parse(raw) as Meetup[];
}
