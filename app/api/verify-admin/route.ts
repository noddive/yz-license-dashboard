// app/api/verify-admin/route.ts
// Verifikasi admin secret dengan ping ke Render backend

import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function POST(req: NextRequest) {
  const { secret } = await req.json()

  try {
    const res = await fetch(`${API_URL}/admin/licenses`, {
      headers: {
        "x-admin-secret": secret,
        "Content-Type": "application/json",
      },
    })

    if (res.ok) return NextResponse.json({ ok: true })
    return NextResponse.json({ ok: false }, { status: 403 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
