import { notFound } from "next/navigation"
import Link from "next/link"
import { recipes, getRecipeById } from "@/lib/recipes"
import type { Recipe } from "@/types/recipe"
import IngredientList from "@/components/IngredientList"
import AddToPlanButton from "@/components/AddToPlanButton"

function watchLinks(recipe: Recipe) {
  const q = encodeURIComponent(recipe.name)
  const isFusion = recipe.region !== "Kolkata" && recipe.region !== "Dhaka"
  const isSweet = recipe.category === "sweet"
  const links: { channel: string; url: string }[] = [
    { channel: "Bong Eats", url: `https://www.youtube.com/@BongEats/search?query=${q}` },
    { channel: "Spice Bangla", url: `https://www.youtube.com/@SpiceBangla/search?query=${q}` },
  ]
  if (!isFusion && !isSweet) {
    links.push({ channel: "Bong Kitchen", url: `https://www.youtube.com/@bongkitchen/search?query=${q}` })
    links.push({ channel: "Kabita's Kitchen", url: `https://www.youtube.com/@KabitasKitchen/search?query=${encodeURIComponent(recipe.name + " bengali")}` })
  }
  if (isSweet) {
    links.push({ channel: "Madhurasrecipe", url: `https://www.youtube.com/@MadhurasRecipe/search?query=${q}` })
  }
  links.push({ channel: "YouTube Search", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.name + " bengali recipe")}` })
  return links.slice(0, 5)
}

export function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.id }))
}

const regionEmoji: Record<string, string> = {
  Kolkata: "🇮🇳",
  Dhaka: "🇧🇩",
  London: "🇬🇧",
  NYC: "🇺🇸",
  Global: "🌏",
}

const difficultyColor: Record<string, string> = {
  easy: "text-green-700 bg-green-50",
  medium: "text-amber-700 bg-amber-50",
  hard: "text-red-700 bg-red-50",
}

export default async function RecipePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ from?: string }> }) {
  const { slug } = await params
  const { from } = await searchParams
  const recipe = getRecipeById(slug)
  if (!recipe) notFound()

  const backHref = from === "planner" ? "/" : "/recipes"
  const backLabel = from === "planner" ? "← Planner" : "← All recipes"

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-800 mb-6 transition-colors">
        {backLabel}
      </Link>

      <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-4 sm:p-8 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{recipe.name}</h1>
          {recipe.bengali && <p className="text-lg sm:text-xl text-amber-600 mt-1">{recipe.bengali}</p>}
          <p className="text-gray-500 mt-3 text-sm max-w-md">{recipe.description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-white border border-amber-200">
              {regionEmoji[recipe.region]} {recipe.region}
            </span>
            <span className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-white border border-amber-200">
              ⏱ {recipe.cookTime} min
            </span>
            <span className={`text-sm px-3 py-1 rounded-full capitalize font-medium ${difficultyColor[recipe.difficulty]}`}>
              {recipe.difficulty}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${recipe.isVeg ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {recipe.isVeg ? "🌿 Veg" : "🍖 Non-veg"}
            </span>
            {recipe.mealType.length > 0 && (
              <AddToPlanButton recipe={{ id: recipe.id, name: recipe.name }} />
            )}
          </div>
        </div>
        <span className="text-7xl hidden sm:block">
          {recipe.isVeg ? "🥬" : recipe.category === "sweet" ? "🍮" : recipe.category === "street-food" ? "🌯" : "🍛"}
        </span>
      </div>

      {recipe.prepNote && (
        <div className="flex gap-3 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 mb-6">
          <span className="text-xl flex-shrink-0">⏳</span>
          <div>
            <p className="text-sm font-semibold text-sky-800">Prep required — {recipe.prepTime} min before cooking</p>
            <p className="text-sm text-sky-700 mt-0.5">{recipe.prepNote}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Ingredients</h2>
          <p className="text-xs text-gray-400 mb-3">Tap the platform buttons to order ingredients for delivery in Bangalore.</p>
          <IngredientList ingredients={recipe.ingredients} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Method</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {recipe.tags.map((tag) => (
          <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-6 border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">▶ Watch it being made</h3>
        <div className="flex flex-wrap gap-2">
          {watchLinks(recipe).map((link) => (
            <a
              key={link.channel}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
            >
              ▶ {link.channel}
            </a>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Opens YouTube search for this recipe on each channel.</p>
      </div>
    </div>
  )
}
