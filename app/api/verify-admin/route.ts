import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? ""

export async function POST(req: NextRequest) {
  const { secret } = await req.json()

  // DEBUG SEMENTARA
  console.log("API_URL:", API_URL)
  console.log("ADMIN_SECRET:", process.env.ADMIN_SECRET)
  console.log("secret from user:", secret)

  try {
    const res = await fetch(`${API_URL}/admin/licenses`, {
      headers: {
        "x-admin-secret": secret,
        "Content-Type": "application/json",
      },
    })
    if (res.ok) return NextResponse.json({ ok: true })
    return NextResponse.json({ ok: false }, { status: 403 })
  } catch (e) {
    console.log("fetch error:", e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}