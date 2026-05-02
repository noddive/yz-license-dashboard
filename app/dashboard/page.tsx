"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

interface License {
  hwid: string
  license_key: string
  is_active: boolean
  note: string
  created_at: string | null
  last_check_at: string | null
  revoked_at: string | null
}

function formatDate(iso: string | null) {
  if (!iso) return "-"
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function timeSince(iso: string | null) {
  if (!iso) return null
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60)    return `${Math.floor(diff)}d lalu`
  if (diff < 3600)  return `${Math.floor(diff/60)}m lalu`
  if (diff < 86400) return `${Math.floor(diff/3600)}j lalu`
  return `${Math.floor(diff/86400)} hari lalu`
}

export default function DashboardPage() {
  const router  = useRouter()
  const [secret, setSecret]     = useState("")
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")

  // Add form
  const [addHwid, setAddHwid]   = useState("")
  const [addKey, setAddKey]     = useState("")
  const [addNote, setAddNote]   = useState("")
  const [addMsg, setAddMsg]     = useState("")
  const [addErr, setAddErr]     = useState("")
  const [adding, setAdding]     = useState(false)

  // Edit note
  const [editingHwid, setEditingHwid] = useState<string | null>(null)
  const [editNote, setEditNote]       = useState("")

  // Search
  const [search, setSearch] = useState("")

  const fetchLicenses = useCallback(async (s: string) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/licenses", {
        headers: { "x-admin-secret": s },
      })
      if (res.status === 403) { router.push("/"); return }
      const data = await res.json()
      setLicenses(data)
    } catch {
      setError("Gagal mengambil data.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const s = sessionStorage.getItem("admin_secret") || ""
    if (!s) { router.push("/"); return }
    setSecret(s)
    fetchLicenses(s)
  }, [fetchLicenses, router])

  async function handleAdd() {
    if (!addHwid || !addKey) { setAddErr("HWID dan License Key wajib diisi."); return }
    setAdding(true); setAddErr(""); setAddMsg("")
    try {
      const res = await fetch("/api/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ hwid: addHwid, license_key: addKey, note: addNote }),
      })
      const data = await res.json()
      if (!res.ok) { setAddErr(data.detail || "Gagal menambahkan."); return }
      setAddMsg("✅ " + data.message)
      setAddHwid(""); setAddKey(""); setAddNote("")
      fetchLicenses(secret)
    } catch {
      setAddErr("Gagal menghubungi server.")
    } finally {
      setAdding(false)
    }
  }

  async function handleRevoke(hwid: string) {
    if (!confirm(`Revoke license untuk ${hwid}?`)) return
    try {
      await fetch("/api/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ hwid }),
      })
      fetchLicenses(secret)
    } catch {
      alert("Gagal revoke.")
    }
  }

  async function handleReactivate(l: License) {
    try {
      await fetch("/api/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ hwid: l.hwid, license_key: l.license_key, note: l.note }),
      })
      fetchLicenses(secret)
    } catch {
      alert("Gagal re-aktivasi.")
    }
  }

  async function handleSaveNote(hwid: string) {
    try {
      await fetch("/api/note", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ hwid, note: editNote }),
      })
      setEditingHwid(null)
      fetchLicenses(secret)
    } catch {
      alert("Gagal simpan catatan.")
    }
  }

  const filtered = licenses.filter(l =>
    l.hwid.includes(search.toUpperCase()) ||
    l.note.toLowerCase().includes(search.toLowerCase()) ||
    l.license_key.includes(search.toUpperCase())
  )

  const activeCount  = licenses.filter(l => l.is_active).length
  const revokedCount = licenses.filter(l => !l.is_active).length

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">🔐 YZ Realtime Translator License Dashboard</h1>
          <p className="text-[#A0AEC0] text-sm mt-1">Kelola lisensi pengguna</p>
        </div>
        <button
          onClick={() => { sessionStorage.clear(); router.push("/") }}
          className="text-[#A0AEC0] hover:text-white text-sm border border-[#2D3748]
                     rounded-lg px-4 py-2 transition-colors hover:border-[#4A5568]"
        >
          Keluar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total License", value: licenses.length, color: "text-white" },
          { label: "Aktif",         value: activeCount,      color: "text-[#00D46A]" },
          { label: "Revoked",       value: revokedCount,     color: "text-[#FF4560]" },
        ].map(s => (
          <div key={s.label} className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
            <p className="text-[#A0AEC0] text-sm">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Add License */}
      <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-4">➕ Tambah License Baru</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={addHwid} onChange={e => setAddHwid(e.target.value)}
            placeholder="HWID (dari user)"
            className="bg-[#0D1117] border border-[#2D3748] rounded-lg px-4 py-2.5
                       text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00D46A]
                       font-mono text-sm transition-colors"
          />
          <input
            value={addKey} onChange={e => setAddKey(e.target.value)}
            placeholder="License Key (dari keygen.py)"
            className="bg-[#0D1117] border border-[#2D3748] rounded-lg px-4 py-2.5
                       text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00D46A]
                       font-mono text-sm transition-colors"
          />
          <input
            value={addNote} onChange={e => setAddNote(e.target.value)}
            placeholder="Catatan (nama user, dll)"
            className="bg-[#0D1117] border border-[#2D3748] rounded-lg px-4 py-2.5
                       text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00D46A]
                       text-sm transition-colors"
          />
        </div>
        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={handleAdd} disabled={adding}
            className="bg-[#00D46A] hover:bg-[#00B358] disabled:opacity-50 text-black
                       font-bold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            {adding ? "Menambahkan..." : "Tambahkan"}
          </button>
          {addMsg && <span className="text-[#00D46A] text-sm">{addMsg}</span>}
          {addErr && <span className="text-[#FF4560] text-sm">{addErr}</span>}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Cari HWID, nama, atau license key..."
          className="w-full bg-[#161B22] border border-[#2D3748] rounded-lg px-4 py-2.5
                     text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00D46A]
                     text-sm transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-[#161B22] border border-[#2D3748] rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center text-[#A0AEC0] py-16">Memuat data...</div>
        ) : error ? (
          <div className="text-center text-[#FF4560] py-16">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-[#A0AEC0] py-16">Tidak ada license ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2D3748] text-[#A0AEC0] text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Nama / Catatan</th>
                  <th className="text-left px-5 py-3">HWID</th>
                  <th className="text-left px-5 py-3">License Key</th>
                  <th className="text-left px-5 py-3">Ditambahkan</th>
                  <th className="text-left px-5 py-3">Last Online</th>
                  <th className="text-left px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => (
                  <tr
                    key={l.hwid}
                    className={`border-b border-[#1C2230] transition-colors hover:bg-[#1C2230]
                                ${i % 2 === 0 ? "" : "bg-[#0D1117]/30"}`}
                  >
                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                        text-xs font-semibold
                                        ${l.is_active
                                          ? "bg-[#00D46A]/15 text-[#00D46A]"
                                          : "bg-[#FF4560]/15 text-[#FF4560]"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full
                                          ${l.is_active ? "bg-[#00D46A]" : "bg-[#FF4560]"}`} />
                        {l.is_active ? "Aktif" : "Revoked"}
                      </span>
                    </td>

                    {/* Note / edit */}
                    <td className="px-5 py-4">
                      {editingHwid === l.hwid ? (
                        <div className="flex gap-2">
                          <input
                            value={editNote}
                            onChange={e => setEditNote(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSaveNote(l.hwid)}
                            className="bg-[#0D1117] border border-[#00D46A] rounded px-2 py-1
                                       text-white text-sm focus:outline-none w-36"
                            autoFocus
                          />
                          <button onClick={() => handleSaveNote(l.hwid)}
                            className="text-[#00D46A] hover:text-white text-xs">✓</button>
                          <button onClick={() => setEditingHwid(null)}
                            className="text-[#A0AEC0] hover:text-white text-xs">✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingHwid(l.hwid); setEditNote(l.note) }}
                          className="text-white hover:text-[#00D46A] text-left transition-colors
                                     group flex items-center gap-1"
                        >
                          <span>{l.note || <span className="text-[#4A5568] italic">Tambah catatan</span>}</span>
                          <span className="text-[#4A5568] group-hover:text-[#00D46A] text-xs">✏</span>
                        </button>
                      )}
                    </td>

                    {/* HWID */}
                    <td className="px-5 py-4">
                      <code className="text-[#7884E4] font-mono text-xs bg-[#7884E4]/10
                                       px-2 py-1 rounded">{l.hwid}</code>
                    </td>

                    {/* License Key */}
                    <td className="px-5 py-4">
                      <code className="text-[#A0AEC0] font-mono text-xs">{l.license_key}</code>
                    </td>

                    {/* Created at */}
                    <td className="px-5 py-4 text-[#A0AEC0] text-xs whitespace-nowrap">
                      {formatDate(l.created_at)}
                    </td>

                    {/* Last online */}
                    <td className="px-5 py-4 text-xs whitespace-nowrap">
                      {l.last_check_at ? (
                        <span className="text-[#00D46A]">{timeSince(l.last_check_at)}</span>
                      ) : (
                        <span className="text-[#4A5568]">Belum pernah</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      {l.is_active ? (
                        <button
                          onClick={() => handleRevoke(l.hwid)}
                          className="text-xs bg-[#FF4560]/15 hover:bg-[#FF4560]/30 text-[#FF4560]
                                     px-3 py-1.5 rounded-lg transition-colors font-medium"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(l)}
                          className="text-xs bg-[#00D46A]/15 hover:bg-[#00D46A]/30 text-[#00D46A]
                                     px-3 py-1.5 rounded-lg transition-colors font-medium"
                        >
                          Aktifkan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-center text-[#4A5568] text-xs mt-6">
        YF License Dashboard · {licenses.length} total license
      </p>
    </div>
  )
}
