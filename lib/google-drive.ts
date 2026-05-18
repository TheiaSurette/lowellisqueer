export async function uploadToDrive(
  file: File,
  folderId: string,
  accessToken: string
): Promise<string> {
  const metadata = JSON.stringify({
    name: `${Date.now()}-${file.name}`,
    parents: [folderId],
  })

  const boundary = "-------314159265358979323846"
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`

  const fileBuffer = await file.arrayBuffer()

  const body = new Blob([
    delimiter,
    "Content-Type: application/json; charset=UTF-8\r\n\r\n",
    metadata,
    delimiter,
    `Content-Type: ${file.type}\r\n\r\n`,
    fileBuffer,
    closeDelimiter,
  ])

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Drive upload failed: ${err}`)
  }

  const data = (await res.json()) as { id: string }

  await fetch(
    `https://www.googleapis.com/drive/v3/files/${data.id}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    }
  )

  return `https://drive.google.com/file/d/${data.id}/view`
}
