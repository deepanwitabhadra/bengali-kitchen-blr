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
  const [maxTime, setMaxTime] = useState<number | undefined>(() =>
    searchParams.get("quick") === "1" ? 30 : undefined
  )

  const mainRecipes = useMemo(() => {
    let list = filtered.filter((r) => r.category !== "sweet")
    if (maxTime) list = list.filter((r) => r.cookTime <= maxTime)
    if (sortByTime) list = [...list].sort((a, b) => a.cookTime - b.cookTime)
    return list
  }, [filtered, maxTime, sortByTime])

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

      {/* Sort + time filter toolbar */}
      <div className="flex gap-2 items-center mb-3 px-1">
        <button
          onClick={() => setMaxTime((t) => (t === 30 ? undefined : 30))}
          className={`text-xs px-3 py-2.5 rounded-full font-semibold transition-colors ${
            maxTime === 30
              ? "bg-emerald-500 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-700"
          }`}
        >
          ⚡ Under 30 min
        </button>
        <button
          onClick={() => setMaxTime((t) => (t === 45 ? undefined : 45))}
          className={`text-xs px-3 py-2.5 rounded-full font-semibold transition-colors ${
            maxTime === 45
              ? "bg-emerald-500 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-700"
          }`}
        >
          ⏳ Under 45 min
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
                {maxTime ? ` · under ${maxTime} min` : ""}
                {sortByTime ? " · sorted by cook time" : ""}
              </p>
              <div className="bg-white rounded-2xl border border-amber-100 shadow-sm divide-y divide-gray-50">
                {mainRecipes.map((r) => (
                  <RecipeRow key={r.id} recipe={r} />
                ))}
              </div>
            </div>
          )}

          {mainRecipes.length === 0 && maxTime && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">⚡</p>
              <p className="text-sm">No recipes under {maxTime} min match the current filters.</p>
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
