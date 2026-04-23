"use client"

import { useState, useCallback, useEffect, Fragment } from "react"
import Link from "next/link"
import type { Recipe, MealType } from "@/types/recipe"
import { autoSuggestMealPlan, recipes as allRecipes, DAYS } from "@/lib/recipes"

type PlanState = Record<string, Record<MealType, Recipe | null>>
const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"]
const MEAL_EMOJI: Record<MealType, string> = { breakfast: "🌅", lunch: "☀️", dinner: "🌙" }
function getMondayISO(): string {
  const today = new Date()
  const dow = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().split("T")[0]
}

function getWeekDates(): Record<string, Date> {
  const dow = new Date().getDay()
  const monday = new Date()
  monday.setDate(monday.getDate() - (dow === 0 ? 6 : dow - 1))
  monday.setHours(0, 0, 0, 0)
  const map: Record<string, Date> = {}
  DAYS.forEach((day, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    map[day] = d
  })
  return map
}

export default function MealPlannerGrid() {
  const [plan, setPlan] = useState<PlanState>({})
  const [swapping, setSwapping] = useState<{ day: string; meal: MealType } | null>(null)
  const [search, setSearch] = useState("")
  const [hasManualSwaps, setHasManualSwaps] = useState(false)
  const [confirmRegen, setConfirmRegen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [weekDates, setWeekDates] = useState<Record<string, Date>>({})

  // Load from localStorage; auto-regen if saved plan is from a previous week
  useEffect(() => {
    const currentMonday = getMondayISO()
    setWeekDates(getWeekDates())
    const raw = localStorage.getItem("bk-plan")
    if (raw) {
      try {
        const { plan: saved, weekStart } = JSON.parse(raw)
        if (weekStart === currentMonday) {
          setPlan(saved)
        } else {
          // New week — auto-regenerate silently
          setPlan(autoSuggestMealPlan())
        }
      } catch {
        setPlan(autoSuggestMealPlan())
      }
    } else {
      setPlan(autoSuggestMealPlan())
    }
    setHydrated(true)
  }, [])

  // Persist plan + current week's Monday on every change
  useEffect(() => {
    if (hydrated && Object.keys(plan).length > 0) {
      localStorage.setItem("bk-plan", JSON.stringify({ plan, weekStart: getMondayISO() }))
    }
  }, [plan, hydrated])

  const generate = useCallback(() => {
    if (hasManualSwaps) {
      setConfirmRegen(true)
      return
    }
    setPlan(autoSuggestMealPlan())
    setSwapping(null)
  }, [hasManualSwaps])

  function swap(day: string, meal: MealType, recipe: Recipe) {
    setPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [meal]: recipe },
    }))
    setHasManualSwaps(true)
    setSwapping(null)
    setSearch("")
  }

  function confirmRegenerate() {
    setPlan(autoSuggestMealPlan())
    setHasManualSwaps(false)
    setConfirmRegen(false)
    setSwapping(null)
  }

  // #2: filter swap pool by the slot's mealType
  const swapPool = swapping
    ? allRecipes.filter((r) => r.mealType.includes(swapping.meal))
    : allRecipes

  const filteredRecipes = search
    ? swapPool.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.tags.some((t) => t.includes(search.toLowerCase()))
      )
    : swapPool

  const hasPlan = Object.keys(plan).length > 0

  // Don't render until hydrated to avoid SSR/localStorage mismatch flicker
  if (!hydrated) {
    return <div className="text-center py-20 text-gray-300 text-sm">Loading your plan…</div>
  }

  if (!hasPlan) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">📅</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your week is empty!</h2>
        <p className="text-gray-500 mb-6 text-sm max-w-sm mx-auto">
          Click below to auto-generate a Bengali meal plan. Weekdays get quick recipes, weekends get the good stuff.
        </p>
        <button
          onClick={() => setPlan(autoSuggestMealPlan())}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-sm"
        >
          ✨ Auto-suggest my week
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top actions */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <button
          onClick={generate}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-full text-sm transition-colors"
        >
          ✨ Re-generate
        </button>
      </div>

      {/* #6: Re-generate confirmation banner */}
      {confirmRegen && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-amber-800">You have custom swaps — re-generating will replace them.</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmRegen(false)} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
              Keep mine
            </button>
            <button onClick={confirmRegenerate} className="text-sm font-semibold text-amber-600 hover:text-amber-800">
              Re-generate
            </button>
          </div>
        </div>
      )}

      {/* #4 Desktop grid — hidden on mobile */}
      <div className="hidden md:block overflow-x-auto -mx-4 px-4">
        <div className="min-w-[700px] grid grid-cols-8 gap-1 text-xs">
          <div className="col-span-1" />
          {DAYS.map((day) => {
            const date = weekDates[day]
            const isToday = date?.toDateString() === new Date().toDateString()
            return (
              <div key={day} className={`text-center font-bold py-2 ${isToday ? "text-amber-600" : "text-gray-700"}`}>
                {day.slice(0, 3)}
                {date && (
                  <span className={`block text-[10px] font-normal ${isToday ? "text-amber-500 font-semibold" : "text-gray-400"}`}>
                    {date.getDate()}/{date.getMonth() + 1}
                  </span>
                )}
                {(day === "Saturday" || day === "Sunday") && !isToday && (
                  <span className="block text-amber-400 text-[10px]">🎉</span>
                )}
              </div>
            )
          })}

          {MEAL_TYPES.map((meal) => (
            <Fragment key={meal}>
              <div className="flex items-center justify-end pr-2 font-semibold text-gray-500 py-1">
                {MEAL_EMOJI[meal]} <span className="ml-1 capitalize">{meal}</span>
              </div>
              {DAYS.map((day) => {
                const recipe = plan[day]?.[meal] ?? null
                const isSwapping = swapping?.day === day && swapping?.meal === meal
                return (
                  <div
                    key={day + meal}
                    className={`rounded-lg p-1.5 min-h-[70px] border transition-colors ${
                      isSwapping ? "border-amber-400 bg-amber-50" : "border-gray-100 bg-white hover:border-amber-200"
                    }`}
                  >
                    {recipe ? (
                      <div className="h-full flex flex-col justify-between">
                        <Link
                          href={`/recipe/${recipe.id}`}
                          className="text-[11px] font-medium text-gray-800 hover:text-amber-700 line-clamp-2 leading-tight"
                        >
                          {recipe.name}
                        </Link>
                        {/* #3: prep badge */}
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400">⏱{recipe.cookTime}m</span>
                            {recipe.prepNote && (
                              <span title={`Prep needed: ${recipe.prepNote}`} className="text-sky-400 cursor-help leading-none">⏳</span>
                            )}
                          </div>
                          <button
                            onClick={() => setSwapping(isSwapping ? null : { day, meal })}
                            className="text-[10px] text-amber-500 hover:text-amber-700 font-medium"
                            title="Swap recipe"
                          >
                            ✎
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSwapping({ day, meal })}
                        className="w-full h-full flex items-center justify-center text-gray-300 hover:text-amber-400 text-lg"
                      >
                        +
                      </button>
                    )}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* #4 Mobile day cards — hidden on desktop */}
      <div className="md:hidden space-y-3">
        {DAYS.map((day) => {
          const date = weekDates[day]
          const isToday = date?.toDateString() === new Date().toDateString()
          const dateLabel = date
            ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
            : ""
          return (
          <div key={day} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isToday ? "border-amber-400" : "border-amber-100"}`}>
            <div className={`px-4 py-2 border-b flex items-center justify-between ${isToday ? "bg-amber-500 border-amber-400" : "bg-amber-50 border-amber-100"}`}>
              <div>
                <span className={`font-bold text-sm ${isToday ? "text-white" : "text-gray-800"}`}>{day}</span>
                {dateLabel && (
                  <span className={`ml-2 text-xs ${isToday ? "text-amber-100" : "text-gray-400"}`}>{dateLabel}</span>
                )}
                {isToday && <span className="ml-2 text-xs text-amber-100 font-medium">Today</span>}
              </div>
              {(day === "Saturday" || day === "Sunday") && !isToday && (
                <span className="text-xs text-amber-500">🎉 Weekend</span>
              )}
            </div>
            {MEAL_TYPES.map((meal) => {
              const recipe = plan[day]?.[meal] ?? null
              const isSwapping = swapping?.day === day && swapping?.meal === meal
              return (
                <div
                  key={meal}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${
                    isSwapping ? "bg-amber-50" : ""
                  }`}
                >
                  <span className="text-base w-5 flex-shrink-0">{MEAL_EMOJI[meal]}</span>
                  <div className="flex-1 min-w-0">
                    {recipe ? (
                      <>
                        <Link
                          href={`/recipe/${recipe.id}`}
                          className="text-sm font-medium text-gray-800 hover:text-amber-700 line-clamp-1 block"
                        >
                          {recipe.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400">⏱{recipe.cookTime}m</span>
                          {recipe.prepNote && (
                            <span title={recipe.prepNote} className="text-[10px] text-sky-500">⏳ Prep</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-gray-300 italic">Not set</span>
                    )}
                  </div>
                  <button
                    onClick={() => setSwapping(isSwapping ? null : { day, meal })}
                    className="text-amber-400 hover:text-amber-600 text-base flex-shrink-0 px-1 font-medium"
                    title={recipe ? "Swap" : "Add"}
                  >
                    {recipe ? "✎" : "+"}
                  </button>
                </div>
              )
            })}
          </div>
          )
        })}
      </div>

      {/* Swap picker */}
      {swapping && (
        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-800 text-sm">
              Choose a recipe for <span className="text-amber-600">{swapping.day} — {swapping.meal}</span>
            </p>
            <button onClick={() => { setSwapping(null); setSearch("") }} className="text-gray-400 hover:text-gray-700 text-lg leading-none">×</button>
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-3 focus:border-amber-400 focus:outline-none"
            autoFocus
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
            {filteredRecipes.map((r) => (
              <button
                key={r.id}
                onClick={() => swap(swapping.day, swapping.meal, r)}
                className="text-left p-2.5 rounded-xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50 transition-colors"
              >
                <p className="text-xs font-semibold text-gray-800 line-clamp-1">{r.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">⏱{r.cookTime}m · {r.region}</p>
              </button>
            ))}
            {filteredRecipes.length === 0 && (
              <p className="col-span-3 text-sm text-gray-400 text-center py-4">No recipes found.</p>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
