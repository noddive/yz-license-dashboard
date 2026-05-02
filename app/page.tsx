"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router  = useRouter()
  const [pass, setPass]     = useState("")
  const [error, setError]   = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!pass.trim()) return
    setLoading(true)
    setError("")

    try {
      // Verifikasi dengan ping ke /admin/licenses pakai password ini
      const res = await fetch("/api/verify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: pass }),
      })

      if (res.ok) {
        sessionStorage.setItem("admin_secret", pass)
        router.push("/dashboard")
      } else {
        setError("Password salah.")
      }
    } catch {
      setError("Tidak bisa menghubungi server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-[#161B22] border border-[#2D3748] rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-xl font-bold text-white">YZ Realtime Translator License Dashboard</h1>
          <p className="text-[#A0AEC0] text-sm mt-1">Masukkan admin password</p>
        </div>

        <input
          type="password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          placeholder="Admin password"
          className="w-full bg-[#0D1117] border border-[#2D3748] rounded-lg px-4 py-3
                     text-white placeholder-[#4A5568] focus:outline-none
                     focus:border-[#00D46A] transition-colors"
        />

        {error && (
          <p className="text-[#FF4560] text-sm mt-2">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-4 bg-[#00D46A] hover:bg-[#00B358] disabled:opacity-50
                     text-black font-bold py-3 rounded-lg transition-colors"
        >
          {loading ? "Memverifikasi..." : "Masuk"}
        </button>
      </div>
    </div>
  )
}
