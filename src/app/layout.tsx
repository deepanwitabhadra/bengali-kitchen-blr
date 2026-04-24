import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"

export const metadata: Metadata = {
  title: "Bengali Kitchen Bangalore",
  description: "Bengali recipes for Bangaloreans — quick weekday meals, global Bengali cuisine, and ingredient help for cooking in Bangalore.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#fffbf5]">
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-amber-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🍛</span>
              <div>
                <p className="font-bold text-amber-800 leading-tight text-base">Bengali Kitchen</p>
                <p className="text-xs text-amber-500 leading-tight">Bangalore Edition</p>
              </div>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/" className="text-gray-600 hover:text-amber-700 transition-colors py-2 px-1">Planner</Link>
              <Link href="/recipes" className="text-gray-600 hover:text-amber-700 transition-colors py-2 px-1">Recipes</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-amber-100 py-6 text-center text-xs text-gray-400 mt-8">
          Made with love for Bengalis in Bangalore 🇮🇳
        </footer>
      </body>
    </html>
  )
}
