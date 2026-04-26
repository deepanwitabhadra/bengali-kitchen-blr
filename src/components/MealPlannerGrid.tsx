"use client"

import { useState, useCallback, useEffect, Fragment } from "react"
import Link from "next/link"
import type { Recipe, MealType, CustomMeal, PlanSlot } from "@/types/recipe"
import { autoSuggestMealPlan, recipes as allRecipes, DAYS, needsStaple, defaultStaple, STAPLE_OPTIONS, STAPLE_LABEL } from "@/lib/recipes"
import type { Staple } from "@/lib/recipes"

type PlanState = Record<string, Record<MealType, PlanSlot>>
type StaplePlan = Record<string, Partial<Record<"lunch" | "dinner", Staple | null>>>
type ExtrasPlan = Record<string, Partial<Record<MealType, PlanSlot[]>>>

function isCustom(slot: PlanSlot): slot is CustomMeal {
  return !!slot && "isCustom" in slot
}

function slotStaple(slot: PlanSlot, day: string): Staple | null {
  if (!slot) return null
  if (isCustom(slot)) return defaultStaple(day)
  return needsStaple(slot) ? defaultStaple(day) : null
}

function autoSuggestStaples(plan: PlanState): StaplePlan {
  const result: StaplePlan = {}
  for (const day of DAYS) {
    result[day] = {}
    for (const meal of ["lunch", "dinner"] as const) {
      result[day][meal] = slotStaple(plan[day]?.[meal] ?? null, day)
    }
  }
  return result
}
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

function offsetMonday(mondayISO: string, weeks: number): string {
  const d = new Date(mondayISO + "T00:00:00")
  d.setDate(d.getDate() + weeks * 7)
  return d.toISOString().split("T")[0]
}

function getWeekDatesFrom(mondayISO: string): Record<string, Date> {
  const monday = new Date(mondayISO + "T00:00:00")
  const map: Record<string, Date> = {}
  DAYS.forEach((day, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    map[day] = d
  })
  return map
}

function formatWeekRange(mondayISO: string): string {
  const monday = new Date(mondayISO + "T00:00:00")
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
  return `${monday.toLocaleDateString("en-IN", opts)} – ${sunday.toLocaleDateString("en-IN", opts)}`
}

function weekKey(mondayISO: string): string {
  return `bk-plan-${mondayISO}`
}

export default function MealPlannerGrid() {
  const [plan, setPlan] = useState<PlanState>({})
  const [staples, setStaples] = useState<StaplePlan>({})
  const [extras, setExtras] = useState<ExtrasPlan>({})
  const [swapping, setSwapping] = useState<{ day: string; meal: MealType } | null>(null)
  const [search, setSearch] = useState("")
  const [addingExtra, setAddingExtra] = useState<{ day: string; meal: MealType } | null>(null)
  const [extraSearch, setExtraSearch] = useState("")
  const [hasManualSwaps, setHasManualSwaps] = useState(false)
  const [confirmRegen, setConfirmRegen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [weekDates, setWeekDates] = useState<Record<string, Date>>({})
  const [selectedMonday, setSelectedMonday] = useState<string>("")

  // On mount: anchor to current week
  useEffect(() => {
    setSelectedMonday(getMondayISO())
  }, [])

  // Load week whenever selectedMonday changes
  useEffect(() => {
    if (!selectedMonday) return
    setHydrated(false)
    setWeekDates(getWeekDatesFrom(selectedMonday))
    const raw = localStorage.getItem(weekKey(selectedMonday))
    if (raw) {
      try {
        const { plan: saved, staples: savedStaples, extras: savedExtras } = JSON.parse(raw)
        setPlan(saved)
        setStaples(savedStaples ?? autoSuggestStaples(saved))
        setExtras(savedExtras ?? {})
      } catch {
        const newPlan = autoSuggestMealPlan()
        setPlan(newPlan)
        setStaples(autoSuggestStaples(newPlan))
        setExtras({})
      }
    } else {
      const newPlan = autoSuggestMealPlan()
      setPlan(newPlan)
      setStaples(autoSuggestStaples(newPlan))
      setExtras({})
    }
    setSwapping(null)
    setAddingExtra(null)
    setHasManualSwaps(false)
    setHydrated(true)
  }, [selectedMonday])

  // Persist plan + staples + extras for the selected week
  useEffect(() => {
    if (hydrated && selectedMonday && Object.keys(plan).length > 0) {
      localStorage.setItem(weekKey(selectedMonday), JSON.stringify({ plan, staples, extras, weekStart: selectedMonday }))
    }
  }, [plan, staples, extras, hydrated, selectedMonday])

  const generate = useCallback(() => {
    if (hasManualSwaps) {
      setConfirmRegen(true)
      return
    }
    const newPlan = autoSuggestMealPlan()
    setPlan(newPlan)
    setStaples(autoSuggestStaples(newPlan))
    setSwapping(null)
  }, [hasManualSwaps])

  function swap(day: string, meal: MealType, slot: PlanSlot) {
    setPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [meal]: slot },
    }))
    if (meal === "lunch" || meal === "dinner") {
      setStaples((prev) => ({
        ...prev,
        [day]: { ...prev[day], [meal]: slotStaple(slot, day) },
      }))
    }
    setHasManualSwaps(true)
    setSwapping(null)
    setSearch("")
  }

  function cycleStaple(day: string, meal: "lunch" | "dinner") {
    setStaples((prev) => {
      const current = prev[day]?.[meal] ?? defaultStaple(day)
      const idx = STAPLE_OPTIONS.indexOf(current)
      const next = STAPLE_OPTIONS[(idx + 1) % STAPLE_OPTIONS.length]
      return { ...prev, [day]: { ...prev[day], [meal]: next } }
    })
  }

  function addExtra(day: string, meal: MealType, slot: PlanSlot) {
    setExtras((prev) => ({
      ...prev,
      [day]: { ...prev[day], [meal]: [...(prev[day]?.[meal] ?? []), slot] },
    }))
    setAddingExtra(null)
    setExtraSearch("")
  }

  function removeExtra(day: string, meal: MealType, idx: number) {
    setExtras((prev) => {
      const updated = (prev[day]?.[meal] ?? []).filter((_, i) => i !== idx)
      return { ...prev, [day]: { ...prev[day], [meal]: updated } }
    })
  }

  function addCustomExtra(day: string, meal: MealType) {
    if (!extraSearch.trim()) return
    addExtra(day, meal, { id: "custom-" + Date.now(), name: extraSearch.trim(), isCustom: true })
  }

  function addCustomMeal(day: string, meal: MealType) {
    if (!search.trim()) return
    const custom: CustomMeal = { id: "custom-" + Date.now(), name: search.trim(), isCustom: true }
    swap(day, meal, custom)
  }

  function confirmRegenerate() {
    const newPlan = autoSuggestMealPlan()
    setPlan(newPlan)
    setStaples(autoSuggestStaples(newPlan))
    setExtras({})
    setHasManualSwaps(false)
    setConfirmRegen(false)
    setSwapping(null)
  }

  function navigate(direction: 1 | -1) {
    if (!selectedMonday) return
    // Save current week before navigating
    if (Object.keys(plan).length > 0) {
      localStorage.setItem(weekKey(selectedMonday), JSON.stringify({ plan, staples, extras, weekStart: selectedMonday }))
    }
    setSelectedMonday(offsetMonday(selectedMonday, direction))
    setConfirmRegen(false)
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

  const filteredExtras = extraSearch
    ? allRecipes.filter(
        (r) =>
          r.name.toLowerCase().includes(extraSearch.toLowerCase()) ||
          r.tags.some((t) => t.includes(extraSearch.toLowerCase()))
      )
    : allRecipes

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
        {selectedMonday && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-amber-400 text-gray-600 hover:text-amber-700 transition-colors text-sm"
              title="Previous week"
            >
              ←
            </button>
            <div className="text-center">
              {selectedMonday === getMondayISO() ? (
                <p className="text-xs font-semibold text-amber-600">This week</p>
              ) : (
                <p className="text-xs font-semibold text-gray-500">
                  {selectedMonday < getMondayISO() ? "Past" : "Future"}
                </p>
              )}
              <p className="text-[11px] text-gray-400">{formatWeekRange(selectedMonday)}</p>
            </div>
            <button
              onClick={() => navigate(1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-amber-400 text-gray-600 hover:text-amber-700 transition-colors text-sm"
              title="Next week"
            >
              →
            </button>
          </div>
        )}
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
                      <div className="h-full flex flex-col">
                        {/* Primary dish */}
                        {isCustom(recipe) ? (
                          <span className="text-[11px] font-medium text-gray-800 line-clamp-1 leading-tight">{recipe.name}</span>
                        ) : (
                          <Link href={`/recipe/${recipe.id}?from=planner`} className="text-[11px] font-medium text-gray-800 hover:text-amber-700 line-clamp-1 leading-tight">
                            {recipe.name}
                          </Link>
                        )}
                        {/* Extra dishes */}
                        {(extras[day]?.[meal] ?? []).map((extra, i) => (
                          <div key={i} className="flex items-center gap-0.5 mt-0.5">
                            <span className="text-[10px] text-gray-500 truncate flex-1 leading-tight">
                              + {isCustom(extra) ? extra.name : (extra as Recipe).name}
                            </span>
                            <button onClick={() => removeExtra(day, meal, i)} className="text-[10px] text-gray-300 hover:text-red-400 flex-shrink-0">×</button>
                          </div>
                        ))}
                        {/* Bottom row */}
                        <div className="flex items-center justify-between mt-auto pt-1">
                          <div className="flex items-center gap-1 flex-wrap">
                            {!isCustom(recipe) && (
                              <>
                                <span className="text-[10px] text-gray-400">⏱{recipe.cookTime}m</span>
                                {recipe.prepNote && <span title={`Prep needed: ${recipe.prepNote}`} className="text-sky-400 cursor-help leading-none">⏳</span>}
                              </>
                            )}
                            {(meal === "lunch" || meal === "dinner") && (isCustom(recipe) || needsStaple(recipe as Recipe) || staples[day]?.[meal as "lunch" | "dinner"] != null) && (
                              <button onClick={() => cycleStaple(day, meal as "lunch" | "dinner")} className="text-[10px] text-emerald-600 hover:text-emerald-800 font-medium leading-none" title="Click to change staple">
                                {STAPLE_LABEL[staples[day]?.[meal as "lunch" | "dinner"] ?? defaultStaple(day)]} ›
                              </button>
                            )}
                            <button onClick={() => setAddingExtra({ day, meal })} className="text-[10px] text-amber-400 hover:text-amber-600 font-medium leading-none">+ dish</button>
                          </div>
                          <button onClick={() => setSwapping(isSwapping ? null : { day, meal })} className="text-[10px] text-amber-500 hover:text-amber-700 font-medium" title="Swap recipe">✎</button>
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
                        {isCustom(recipe) ? (
                          <span className="text-sm font-medium text-gray-800 line-clamp-1 block">{recipe.name}</span>
                        ) : (
                          <Link href={`/recipe/${recipe.id}?from=planner`} className="text-sm font-medium text-gray-800 hover:text-amber-700 line-clamp-1 block">
                            {recipe.name}
                          </Link>
                        )}
                        {/* Extra dishes */}
                        {(extras[day]?.[meal] ?? []).map((extra, i) => (
                          <div key={i} className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs text-gray-500 truncate flex-1">+ {isCustom(extra) ? extra.name : (extra as Recipe).name}</span>
                            <button onClick={() => removeExtra(day, meal, i)} className="text-xs text-gray-300 hover:text-red-400 flex-shrink-0">×</button>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {!isCustom(recipe) && (
                            <>
                              <span className="text-[10px] text-gray-400">⏱{recipe.cookTime}m</span>
                              {recipe.prepNote && <span title={recipe.prepNote} className="text-[10px] text-sky-500">⏳ Prep</span>}
                            </>
                          )}
                          {(meal === "lunch" || meal === "dinner") && (isCustom(recipe) || needsStaple(recipe as Recipe) || staples[day]?.[meal as "lunch" | "dinner"] != null) && (
                            <button onClick={() => cycleStaple(day, meal as "lunch" | "dinner")} className="text-[10px] text-emerald-600 hover:text-emerald-800 font-medium" title="Tap to change">
                              {STAPLE_LABEL[staples[day]?.[meal as "lunch" | "dinner"] ?? defaultStaple(day)]} ›
                            </button>
                          )}
                          <button onClick={() => setAddingExtra({ day, meal })} className="text-[10px] text-amber-400 hover:text-amber-600 font-medium">+ dish</button>
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
          <div className="mt-3 pt-3 border-t border-gray-100">
            {search.trim() ? (
              <button
                onClick={() => addCustomMeal(swapping.day, swapping.meal)}
                className="w-full text-sm font-medium text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl px-3 py-2.5 transition-colors text-left"
              >
                + Add &ldquo;{search.trim()}&rdquo; as custom meal
              </button>
            ) : (
              <p className="text-xs text-gray-400 text-center py-1">Type a name above to add a custom meal</p>
            )}
          </div>
        </div>
      )}

      {/* Extra dish picker */}
      {addingExtra && (
        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-800 text-sm">
              Add a dish to <span className="text-amber-600">{addingExtra.day} — {addingExtra.meal}</span>
            </p>
            <button onClick={() => { setAddingExtra(null); setExtraSearch("") }} className="text-gray-400 hover:text-gray-700 text-lg leading-none">×</button>
          </div>
          {(addingExtra.meal === "lunch" || addingExtra.meal === "dinner") && (
            <div className="flex flex-wrap gap-2 mb-3">
              {STAPLE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStaples((prev) => ({ ...prev, [addingExtra.day]: { ...prev[addingExtra.day], [addingExtra.meal]: s } }))
                    setAddingExtra(null)
                    setExtraSearch("")
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  {STAPLE_LABEL[s]}
                </button>
              ))}
            </div>
          )}
          <input
            type="text"
            placeholder="Search or type a dish name..."
            value={extraSearch}
            onChange={(e) => setExtraSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-3 focus:border-amber-400 focus:outline-none"
            autoFocus
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
            {filteredExtras.map((r) => (
              <button
                key={r.id}
                onClick={() => addExtra(addingExtra.day, addingExtra.meal, r)}
                className="text-left p-2.5 rounded-xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50 transition-colors"
              >
                <p className="text-xs font-semibold text-gray-800 line-clamp-1">{r.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">⏱{r.cookTime}m · {r.region}</p>
              </button>
            ))}
            {filteredExtras.length === 0 && (
              <p className="col-span-3 text-sm text-gray-400 text-center py-4">No recipes found.</p>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            {extraSearch.trim() ? (
              <button
                onClick={() => addCustomExtra(addingExtra.day, addingExtra.meal)}
                className="w-full text-sm font-medium text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl px-3 py-2.5 transition-colors text-left"
              >
                + Add &ldquo;{extraSearch.trim()}&rdquo; as custom dish
              </button>
            ) : (
              <p className="text-xs text-gray-400 text-center py-1">Type a name above to add a custom dish</p>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
