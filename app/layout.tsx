import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "YZ RT License Dashboard",
  description: "Manage YZ Realtime Translator licenses",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-[#0D1117] text-[#F0F4F8] min-h-screen">{children}</body>
    </html>
  )
}
