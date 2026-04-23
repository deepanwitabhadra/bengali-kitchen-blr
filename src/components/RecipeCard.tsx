import Link from "next/link"
import type { Recipe } from "@/types/recipe"

const regionColors: Record<string, string> = {
  Kolkata: "bg-amber-100 text-amber-800",
  Dhaka: "bg-green-100 text-green-800",
  London: "bg-blue-100 text-blue-800",
  NYC: "bg-purple-100 text-purple-800",
  Global: "bg-rose-100 text-rose-800",
}

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipe/${recipe.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-amber-100 hover:shadow-md hover:border-amber-300 transition-all duration-200">
        <div className="relative h-44 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
          <span className="text-5xl">
            {recipe.isVeg ? "🥬" : recipe.category === "sweet" ? "🍮" : recipe.category === "street-food" ? "🌯" : "🍛"}
          </span>
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${regionColors[recipe.region] ?? "bg-gray-100 text-gray-700"}`}>
              {recipe.region}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`w-3 h-3 rounded-full inline-block border-2 border-white ${recipe.isVeg ? "bg-green-500" : "bg-red-500"}`} title={recipe.isVeg ? "Vegetarian" : "Non-vegetarian"} />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-base group-hover:text-amber-700 transition-colors leading-tight">{recipe.name}</h3>
          {recipe.bengali && <p className="text-sm text-amber-600 mt-0.5">{recipe.bengali}</p>}
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{recipe.description}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
              ⏱ {recipe.cookTime} min
            </span>
            <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full capitalize">
              {recipe.difficulty}
            </span>
            {recipe.cookTime <= 30 && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                Quick!
              </span>
            )}
            {recipe.prepNote && (
              <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-1 rounded-full">
                Prep needed
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
