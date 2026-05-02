// app/api/revoke/route.ts

import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret") || ""
  const body   = await req.json()
  const res = await fetch(`${API_URL}/admin/revoke`, {
    method: "POST",
    headers: { "x-admin-secret": secret, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
