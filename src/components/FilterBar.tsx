"use client"

import { useState } from "react"
import type { Recipe, Category } from "@/types/recipe"
import { filterRecipes } from "@/lib/recipes"

const TIME_FILTERS = [
  { label: "Any time", value: undefined },
  { label: "≤ 30 min", value: 30 },
  { label: "≤ 45 min", value: 45 },
]

const CATEGORY_FILTERS: { label: string; value: Category | undefined }[] = [
  { label: "All dishes", value: undefined },
  { label: "Curries", value: "curry" },
  { label: "Street Food", value: "street-food" },
  { label: "Sweets", value: "sweet" },
  { label: "Snacks", value: "snack" },
  { label: "Fusion", value: "fusion" },
]

interface FilterBarProps {
  onFilter: (recipes: Recipe[]) => void
}

export default function FilterBar({ onFilter }: FilterBarProps) {
  const [maxTime, setMaxTime] = useState<number | undefined>(undefined)
  const [category, setCategory] = useState<Category | undefined>(undefined)
  const [isVeg, setIsVeg] = useState<boolean | undefined>(undefined)
  const [search, setSearch] = useState("")

  function apply(overrides: Partial<{ maxTime: number | undefined; category: Category | undefined; isVeg: boolean | undefined; search: string }>) {
    const opts = {
      maxCookTime: "maxTime" in overrides ? overrides.maxTime : maxTime,
      category: "category" in overrides ? overrides.category : category,
      isVeg: "isVeg" in overrides ? overrides.isVeg : isVeg,
      search: "search" in overrides ? overrides.search : search,
    }
    onFilter(filterRecipes(opts))
  }

  function chip(label: string, active: boolean, onClick: () => void) {
    return (
      <button
        key={label}
        onClick={onClick}
        className={`px-3 py-2.5 rounded-full text-sm font-medium transition-all ${
          active
            ? "bg-amber-500 text-white shadow-sm"
            : "bg-white text-gray-600 border border-gray-200 hover:border-amber-400 hover:text-amber-700"
        }`}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); apply({ search: e.target.value }) }}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:outline-none text-sm bg-white"
      />

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">Time</span>
        {TIME_FILTERS.map((f) =>
          chip(f.label, maxTime === f.value, () => { setMaxTime(f.value); apply({ maxTime: f.value }) })
        )}
        {chip(isVeg === true ? "✓ Veg only" : "Veg only", isVeg === true, () => {
          const next = isVeg === true ? undefined : true
          setIsVeg(next)
          apply({ isVeg: next })
        })}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">Category</span>
        {CATEGORY_FILTERS.map((f) =>
          chip(f.label, category === f.value, () => { setCategory(f.value); apply({ category: f.value }) })
        )}
      </div>

    </div>
  )
}
