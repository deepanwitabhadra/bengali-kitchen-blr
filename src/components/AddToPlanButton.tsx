"use client"

import { useState } from "react"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MEALS = ["breakfast", "lunch", "dinner"] as const
type Meal = typeof MEALS[number]

interface Props {
  recipe: { id: string; name: string }
}

export default function AddToPlanButton({ recipe }: Props) {
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState("Monday")
  const [meal, setMeal] = useState<Meal>("dinner")
  const [toast, setToast] = useState<string | null>(null)

  function addToPlan() {
    const saved = localStorage.getItem("bk-plan")
    const plan = saved ? JSON.parse(saved) : {}
    plan[day] = { ...(plan[day] ?? {}), [meal]: recipe }
    localStorage.setItem("bk-plan", JSON.stringify(plan))
    setOpen(false)
    setToast(`Added to ${day} — ${meal}`)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-white border border-amber-300 hover:border-amber-500 text-amber-700 font-semibold transition-colors"
      >
        📅 Add to plan
      </button>

      {toast && (
        <div className="absolute left-0 top-full mt-2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-20">
          ✓ {toast} —{" "}
          <a href="/" className="underline text-amber-300 hover:text-amber-200">View planner</a>
        </div>
      )}

      {open && (
        <div className="absolute left-0 top-full mt-2 bg-white border border-amber-200 rounded-2xl shadow-xl p-4 z-20 w-64">
          <p className="text-sm font-semibold text-gray-800 mb-3">Add to which slot?</p>
          <div className="mb-3">
            <label className="text-xs text-gray-500 block mb-1">Day</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:border-amber-400 focus:outline-none"
            >
              {DAYS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-500 block mb-1">Meal</label>
            <div className="flex gap-2">
              {MEALS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMeal(m)}
                  className={`flex-1 text-xs py-1.5 rounded-lg font-medium capitalize transition-colors ${
                    meal === m
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 text-sm text-gray-500 hover:text-gray-700 py-1.5 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={addToPlan}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-1.5 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
