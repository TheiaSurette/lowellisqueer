import { NextResponse } from "next/server"
import { sendWeeklyDigest } from "@/lib/email/send-weekly-digest"

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await sendWeeklyDigest()

    return NextResponse.json({
      message: `Digest sent with ${result.eventCount} event${result.eventCount !== 1 ? "s" : ""}`,
      broadcastId: result.broadcastId,
    })
  } catch (error) {
    console.error("Weekly digest failed:", error)
    return NextResponse.json(
      { error: "Failed to send weekly digest" },
      { status: 500 }
    )
  }
}
