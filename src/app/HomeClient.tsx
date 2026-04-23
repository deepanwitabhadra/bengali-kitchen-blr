"use client"

import { useState } from "react"
import RecipeCard from "@/components/RecipeCard"
import FilterBar from "@/components/FilterBar"
import type { Recipe } from "@/types/recipe"

export default function HomeClient({ allRecipes }: { allRecipes: Recipe[] }) {
  const [recipes, setRecipes] = useState<Recipe[]>(allRecipes)

  return (
    <>
      <section className="bg-gradient-to-br from-amber-600 to-orange-500 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Bengali flavours,<br />Bangalore life.
          </h1>
          <p className="mt-3 text-amber-100 text-base max-w-xl">
            Quick weekday meals, weekend feasts, and global Bengali recipes — with ingredient substitutions for what's actually available in Bangalore.
          </p>
          <div className="flex gap-4 mt-5 text-sm">
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{allRecipes.length}</p>
              <p className="text-amber-100 text-xs">Recipes</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{allRecipes.filter(r => r.cookTime <= 30).length}</p>
              <p className="text-amber-100 text-xs">Under 30 min</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">5</p>
              <p className="text-amber-100 text-xs">Regions</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
          <FilterBar onFilter={setRecipes} />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
          </p>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>No recipes match your filters. Try adjusting them!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
