// app/api/licenses/route.ts

import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret") || ""
  const res = await fetch(`${API_URL}/admin/licenses`, {
    headers: { "x-admin-secret": secret },
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret") || ""
  const body   = await req.json()
  const res = await fetch(`${API_URL}/admin/licenses`, {
    method: "POST",
    headers: { "x-admin-secret": secret, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
