import { NextResponse } from "next/server"
import { sendWeeklyDigest } from "@/lib/email/send-weekly-digest"

function authorize(request: Request): boolean {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  return Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`)
}

async function handleDigest() {
  const result = await sendWeeklyDigest()
  return NextResponse.json({
    message: `Digest sent with ${result.eventCount} event${result.eventCount !== 1 ? "s" : ""}`,
    broadcastId: result.broadcastId,
  })
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    return await handleDigest()
  } catch (error) {
    console.error("Weekly digest failed:", error)
    return NextResponse.json(
      { error: "Failed to send weekly digest" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    return await handleDigest()
  } catch (error) {
    console.error("Weekly digest failed:", error)
    return NextResponse.json(
      { error: "Failed to send weekly digest" },
      { status: 500 }
    )
  }
}
