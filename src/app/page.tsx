import MealPlannerGrid from "@/components/MealPlannerGrid"
import Link from "next/link"
import { recipes } from "@/lib/recipes"

export default function Home() {
  const quickCount = recipes.filter((r) => r.cookTime <= 30).length
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Meal Planner</h1>
          <p className="text-gray-500 mt-1 text-sm max-w-lg">
            Auto-generate a Bengali meal plan for your week. Weekdays get quick recipes, weekends get the good stuff.
            Swap any meal, add extras, and plan as far ahead as you like.
          </p>
        </div>
        <div className="flex gap-3 text-xs text-gray-500">
          <Link href="/recipes" className="bg-white border border-amber-200 hover:bg-amber-50 hover:border-amber-400 rounded-xl px-3 py-2 text-center shadow-sm transition-colors group">
            <span className="block text-lg font-bold text-gray-800 group-hover:text-amber-700 transition-colors">{recipes.length}</span>
            <span className="group-hover:text-amber-600 transition-colors">recipes →</span>
          </Link>
          <Link href="/recipes?quick=1" className="bg-white border border-amber-200 hover:bg-amber-50 hover:border-amber-400 rounded-xl px-3 py-2 text-center shadow-sm transition-colors group">
            <span className="block text-lg font-bold text-gray-800 group-hover:text-amber-700 transition-colors">{quickCount}</span>
            <span className="group-hover:text-amber-600 transition-colors">under 30 min →</span>
          </Link>
        </div>
      </div>
      <MealPlannerGrid />
      <p className="mt-6 text-center text-xs text-gray-400">
        Looking for something specific?{" "}
        <Link href="/recipes" className="text-amber-600 hover:text-amber-800 font-medium">Browse all recipes →</Link>
      </p>
    </div>
  )
}
