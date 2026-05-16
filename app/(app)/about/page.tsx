import type { Metadata } from "next"
import { cacheLife } from "next/cache"
import { MDXRemote } from "next-mdx-remote/rsc"
import { getAboutContent } from "@/lib/content"

export const metadata: Metadata = {
  title: "About | Lowell Is Queer",
  description: "About Lowell Is Queer — LGBTQ+ community in Lowell, MA",
}

export default async function AboutPage() {
  "use cache"
  cacheLife("max")

  const aboutSource = await getAboutContent()

  return (
    <div className="mx-auto max-w-[800px] px-8 py-16">
      <h1 className="mb-10 font-heading text-3xl font-black tracking-tight">
        About
      </h1>

      <section>
        <div className="prose-content prose-a:no-underline hover:prose-a:underline">
          <MDXRemote source={aboutSource} />
        </div>
      </section>
    </div>
  )
}
