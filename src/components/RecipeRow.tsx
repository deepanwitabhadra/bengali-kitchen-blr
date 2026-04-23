import Link from "next/link"
import type { Recipe } from "@/types/recipe"

const regionColors: Record<string, string> = {
  Kolkata: "bg-amber-100 text-amber-800",
  Dhaka: "bg-green-100 text-green-800",
  London: "bg-blue-100 text-blue-800",
  NYC: "bg-purple-100 text-purple-800",
  Global: "bg-rose-100 text-rose-800",
}

export default function RecipeRow({ recipe }: { recipe: Recipe }) {
  const emoji = recipe.category === "sweet"
    ? "🍮"
    : recipe.category === "street-food"
    ? "🌯"
    : recipe.category === "snack"
    ? "🥨"
    : recipe.category === "bread"
    ? "🫓"
    : recipe.category === "rice"
    ? "🍚"
    : recipe.isVeg
    ? "🥬"
    : "🍛"

  return (
    <Link href={`/recipe/${recipe.id}`} className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 transition-colors">
      <span className="text-2xl w-9 h-9 flex items-center justify-center bg-amber-50 rounded-lg flex-shrink-0 group-hover:bg-amber-100 transition-colors">
        {emoji}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm group-hover:text-amber-700 transition-colors leading-tight">
            {recipe.name}
          </span>
          {recipe.bengali && (
            <span className="text-xs text-amber-500 leading-tight">{recipe.bengali}</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{recipe.description}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
        <span className="text-xs text-gray-500 whitespace-nowrap">⏱ {recipe.cookTime}m</span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${regionColors[recipe.region] ?? "bg-gray-100 text-gray-700"}`}>
          {recipe.region}
        </span>
        {recipe.cookTime <= 30 && (
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">Quick</span>
        )}
        {recipe.prepNote && (
          <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-full">Prep</span>
        )}
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${recipe.isVeg ? "bg-green-500" : "bg-red-400"}`} title={recipe.isVeg ? "Veg" : "Non-veg"} />
      </div>
    </Link>
  )
}
