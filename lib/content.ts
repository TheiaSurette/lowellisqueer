import fs from "fs/promises"
import path from "path"
import type { Meetup, PrideSpotlight, Resource, SocialLink } from "./types"

const contentDir = path.join(process.cwd(), "content")

async function readContentFile(filename: string): Promise<string> {
  try {
    return await fs.readFile(path.join(contentDir, filename), "utf-8")
  } catch (error) {
    throw new Error(`Failed to read content file: ${filename}`, {
      cause: error,
    })
  }
}

async function readJsonContent<T>(filename: string): Promise<T> {
  const raw = await readContentFile(filename)
  try {
    return JSON.parse(raw) as T
  } catch (error) {
    throw new Error(`Failed to parse content file: ${filename}`, {
      cause: error,
    })
  }
}

export async function getAboutContent(): Promise<string> {
  return readContentFile("about.mdx")
}

export async function getResourcesContent(): Promise<string> {
  return readContentFile("resources.mdx")
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  return readJsonContent<SocialLink[]>("social-links.json")
}

export async function getMeetupsContent(): Promise<string> {
  return readContentFile("meetups.mdx")
}

export async function getMeetups(): Promise<Meetup[]> {
  return readJsonContent<Meetup[]>("meetups.json")
}

export async function getResources(): Promise<Resource[]> {
  return readJsonContent<Resource[]>("resources.json")
}

export async function getPrideSpotlights(): Promise<PrideSpotlight[]> {
  return readJsonContent<PrideSpotlight[]>("pride-spotlights.json")
}
