// lib/api.ts — Helper untuk call ke Render backend

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export interface License {
  hwid: string
  license_key: string
  is_active: boolean
  note: string
  created_at: string | null
  last_check_at: string | null
  revoked_at: string | null
}

async function adminFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": process.env.ADMIN_SECRET!,
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || "Request failed")
  }
  return res.json()
}

export async function getLicenses(): Promise<License[]> {
  return adminFetch("/admin/licenses")
}

export async function addLicense(hwid: string, licenseKey: string, note: string) {
  return adminFetch("/admin/licenses", {
    method: "POST",
    body: JSON.stringify({ hwid, license_key: licenseKey, note }),
  })
}

export async function revokeLicense(hwid: string) {
  return adminFetch("/admin/revoke", {
    method: "POST",
    body: JSON.stringify({ hwid }),
  })
}

export async function updateNote(hwid: string, note: string) {
  return adminFetch("/admin/note", {
    method: "POST",
    body: JSON.stringify({ hwid, note }),
  })
}
