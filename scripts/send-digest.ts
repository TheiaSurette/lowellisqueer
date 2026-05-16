import { sendWeeklyDigest } from "../lib/email/send-weekly-digest"

const testEmail = process.argv[2] || process.env.TEST_EMAIL
if (!testEmail) {
  console.error("Usage: tsx scripts/send-digest.ts <email>")
  process.exit(1)
}

async function main() {
  console.log(`Sending test digest to ${testEmail}...`)
  const result = await sendWeeklyDigest({ testAddress: testEmail })

  console.log(
    `Test email sent! ID: ${result.emailId} (${result.eventCount} events)`
  )
}

main().catch((err: Error) => {
  console.error("Error:", err.message)
  process.exit(1)
})
