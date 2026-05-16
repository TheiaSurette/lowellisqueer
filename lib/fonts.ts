export const FONT_URLS = {
  soraLight:
    "https://fonts.gstatic.com/s/sora/v17/xMQOuFFYT72X5wkB_18qmnndmScMnn-K.ttf",
  sora: "https://fonts.gstatic.com/s/sora/v17/xMQOuFFYT72X5wkB_18qmnndmSdSnn-K.ttf",
  soraMedium:
    "https://fonts.gstatic.com/s/sora/v17/xMQOuFFYT72X5wkB_18qmnndmSdgnn-K.ttf",
  fraunces:
    "https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcUByjDg.ttf",
  frauncesBlack:
    "https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcHhyjDg.ttf",
} as const

export type SatoriFontConfig = {
  name: string
  data: ArrayBuffer
  weight: 300 | 400 | 500 | 700 | 900
  style: "normal"
}

export async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch font: ${res.status}`)
  return res.arrayBuffer()
}

export async function loadAllFonts(): Promise<SatoriFontConfig[]> {
  const [soraLight, sora, soraMedium, fraunces, frauncesBlack] =
    await Promise.all([
      loadFont(FONT_URLS.soraLight),
      loadFont(FONT_URLS.sora),
      loadFont(FONT_URLS.soraMedium),
      loadFont(FONT_URLS.fraunces),
      loadFont(FONT_URLS.frauncesBlack),
    ])

  return [
    {
      name: "Sora",
      data: soraLight,
      weight: 300 as const,
      style: "normal" as const,
    },
    {
      name: "Sora",
      data: sora,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Sora",
      data: soraMedium,
      weight: 500 as const,
      style: "normal" as const,
    },
    {
      name: "Fraunces",
      data: fraunces,
      weight: 700 as const,
      style: "normal" as const,
    },
    {
      name: "Fraunces",
      data: frauncesBlack,
      weight: 900 as const,
      style: "normal" as const,
    },
  ]
}
