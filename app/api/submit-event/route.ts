import { NextResponse } from "next/server"
import { getAccessToken } from "@/lib/google-auth"
import { uploadToDrive } from "@/lib/google-drive"
import { appendRow } from "@/lib/google-sheets"

const REQUIRED_FIELDS = ["name", "title", "description", "datetime", "location"]
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    for (const field of REQUIRED_FIELDS) {
      const value = formData.get(field)
      if (!value || (typeof value === "string" && !value.trim())) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    const name = (formData.get("name") as string).trim()
    const title = (formData.get("title") as string).trim()
    const description = (formData.get("description") as string).trim()
    const datetime = (formData.get("datetime") as string).trim()
    const location = (formData.get("location") as string).trim()
    const instagram = ((formData.get("instagram") as string) || "").trim()
    const image = formData.get("image") as File | null

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
    const sheetId = process.env.GOOGLE_SHEET_ID

    if (!clientId || !clientSecret || !refreshToken || !sheetId) {
      return NextResponse.json(
        { error: "Submission is not configured" },
        { status: 500 }
      )
    }

    const accessToken = await getAccessToken(clientId, clientSecret, refreshToken)

    let imageUrl = ""

    if (image && image.size > 0) {
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

      if (!folderId) {
        return NextResponse.json(
          { error: "Image upload is not configured" },
          { status: 500 }
        )
      }

      if (image.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: "Image must be under 10MB" },
          { status: 400 }
        )
      }

      imageUrl = await uploadToDrive(image, folderId, accessToken)
    }

    await appendRow(
      sheetId,
      [
        new Date().toISOString(),
        name,
        title,
        description,
        datetime,
        location,
        imageUrl,
        instagram,
      ],
      accessToken
    )

    return NextResponse.json({ message: "Event submitted successfully" })
  } catch (error) {
    console.error("Event submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit event. Please try again." },
      { status: 500 }
    )
  }
}
