import { Suspense } from "react"
import { recipes } from "@/lib/recipes"
import RecipesClient from "./RecipesClient"

export const metadata = {
  title: "Recipes — Bengali Kitchen Bangalore",
}

export default function RecipesPage() {
  return (
    <Suspense>
      <RecipesClient allRecipes={recipes} />
    </Suspense>
  )
}
