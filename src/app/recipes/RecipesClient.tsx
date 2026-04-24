"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import RecipeRow from "@/components/RecipeRow"
import FilterBar from "@/components/FilterBar"
import type { Recipe } from "@/types/recipe"

export default function RecipesClient({ allRecipes }: { allRecipes: Recipe[] }) {
  const searchParams = useSearchParams()
  const [filtered, setFiltered] = useState<Recipe[]>(allRecipes)
  const [sortByTime, setSortByTime] = useState(false)
  const [quickOnly, setQuickOnly] = useState(() => searchParams.get("quick") === "1")

  const mainRecipes = useMemo(() => {
    let list = filtered.filter((r) => r.category !== "sweet")
    if (quickOnly) list = list.filter((r) => r.cookTime <= 30)
    if (sortByTime) list = [...list].sort((a, b) => a.cookTime - b.cookTime)
    return list
  }, [filtered, quickOnly, sortByTime])

  const sweets = useMemo(() => filtered.filter((r) => r.category === "sweet"), [filtered])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-800 mb-3 transition-colors">
          ← Planner
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">All Recipes</h1>
        <p className="text-gray-500 mt-1 text-sm">Quick reference — tap any recipe for full details and ingredient order links.</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 mb-4">
        <FilterBar onFilter={setFiltered} />
      </div>

      {/* #8 Sort + quick filter toolbar */}
      <div className="flex gap-2 items-center mb-3 px-1">
        <button
          onClick={() => setQuickOnly((q) => !q)}
          className={`text-xs px-3 py-2.5 rounded-full font-semibold transition-colors ${
            quickOnly
              ? "bg-emerald-500 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-700"
          }`}
        >
          ⚡ Under 30 min
        </button>
        <button
          onClick={() => setSortByTime((s) => !s)}
          className={`text-xs px-3 py-2.5 rounded-full font-semibold transition-colors ${
            sortByTime
              ? "bg-amber-500 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700"
          }`}
        >
          ⏱ Sort by time
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">No recipes match. Try adjusting the filters.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {mainRecipes.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2 px-1">
                {mainRecipes.length} recipe{mainRecipes.length !== 1 ? "s" : ""}
                {quickOnly ? " · under 30 min" : ""}
                {sortByTime ? " · sorted by cook time" : ""}
              </p>
              <div className="bg-white rounded-2xl border border-amber-100 shadow-sm divide-y divide-gray-50">
                {mainRecipes.map((r) => (
                  <RecipeRow key={r.id} recipe={r} />
                ))}
              </div>
            </div>
          )}

          {mainRecipes.length === 0 && quickOnly && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">⚡</p>
              <p className="text-sm">No recipes under 30 min match the current filters.</p>
            </div>
          )}

          {sweets.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-lg">🍮</span>
                <h2 className="text-base font-bold text-gray-800">Sweets</h2>
                <span className="text-xs text-gray-400">{sweets.length} Bengali mithai</span>
              </div>
              <div className="bg-white rounded-2xl border border-pink-100 shadow-sm divide-y divide-gray-50">
                {sweets.map((r) => (
                  <RecipeRow key={r.id} recipe={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
