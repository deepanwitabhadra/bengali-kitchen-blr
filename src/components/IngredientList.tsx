import type { Ingredient } from "@/types/recipe"

function orderUrl(platform: "blinkit" | "bigbasket" | "swiggy", query: string) {
  const encoded = encodeURIComponent(query)
  if (platform === "blinkit") return `https://blinkit.com/s/?q=${encoded}`
  if (platform === "bigbasket") return `https://www.bigbasket.com/ps/?q=${encoded}`
  return `https://www.swiggy.com/instamart/search?query=${encoded}`
}

const platformConfig = {
  blinkit: { label: "Blinkit", color: "bg-yellow-400 hover:bg-yellow-500 text-yellow-900" },
  bigbasket: { label: "BigBasket", color: "bg-green-600 hover:bg-green-700 text-white" },
  swiggy: { label: "Swiggy", color: "bg-orange-500 hover:bg-orange-600 text-white" },
} as const

export default function IngredientList({ ingredients }: { ingredients: Ingredient[] }) {
  return (
    <ul className="space-y-4">
      {ingredients.map((ing, i) => (
        <li key={i} className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <span className="font-semibold text-gray-900">{ing.amount}</span>{" "}
              <span className="text-gray-700">{ing.name}</span>
            </div>
            {ing.orderLinks && (
              <div className="flex gap-1.5 flex-wrap">
                {(["blinkit", "bigbasket", "swiggy"] as const).map((platform) => {
                  const query = ing.orderLinks?.[platform]
                  if (!query) return null
                  const conf = platformConfig[platform]
                  return (
                    <a
                      key={platform}
                      href={orderUrl(platform, query)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${conf.color}`}
                    >
                      {conf.label}
                    </a>
                  )
                })}
              </div>
            )}
          </div>
          {ing.bangaloreSubstitute && (
            <p className="mt-2 text-xs text-amber-700 flex gap-1.5">
              <span>💡</span>
              <span><strong>In Bangalore:</strong> {ing.bangaloreSubstitute}</span>
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
