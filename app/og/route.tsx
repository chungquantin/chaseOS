import { ImageResponse } from 'next/og'

export function GET(request: Request) {
  let url = new URL(request.url)
  let title = url.searchParams.get('title') || 'Tin Chung'

  return new ImageResponse(
    (
      <div tw="flex flex-col w-full h-full items-center justify-center bg-[#faf9f6] text-[#171717]">
        <div tw="flex flex-col w-full h-full justify-between p-16">
          <div tw="flex text-2xl text-neutral-500">chungquantin</div>
          <h2 tw="flex flex-col text-6xl font-medium tracking-tight text-left max-w-4xl">
            {title}
          </h2>
          <div tw="flex text-2xl text-neutral-500">
            Software engineer | Blockchain & AI
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
