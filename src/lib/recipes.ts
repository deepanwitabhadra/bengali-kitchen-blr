import recipesData from "../../data/recipes.json"
import type { Recipe, MealType, Category, Region } from "@/types/recipe"

export const recipes: Recipe[] = recipesData as Recipe[]

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find((r) => r.id === id)
}

export interface FilterOptions {
  maxCookTime?: number
  isVeg?: boolean
  category?: Category
  region?: Region
  mealType?: MealType
  search?: string
}

export function filterRecipes(options: FilterOptions): Recipe[] {
  return recipes.filter((r) => {
    if (options.maxCookTime && r.cookTime > options.maxCookTime) return false
    if (options.isVeg !== undefined && r.isVeg !== options.isVeg) return false
    if (options.category && r.category !== options.category) return false
    if (options.region && r.region !== options.region) return false
    if (options.mealType && !r.mealType.includes(options.mealType)) return false
    if (options.search) {
      const q = options.search.toLowerCase()
      if (
        !r.name.toLowerCase().includes(q) &&
        !r.description.toLowerCase().includes(q) &&
        !r.tags.some((t) => t.includes(q))
      )
        return false
    }
    return true
  })
}

export function getRecipesByMealType(mealType: MealType): Recipe[] {
  return recipes.filter((r) => r.mealType.includes(mealType))
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MEALS: MealType[] = ["breakfast", "lunch", "dinner"]

interface PlanContext {
  usedRecipeIds: Set<string>
  categoryCount: Map<Category, number>
  regionCount: Map<Region, number>
  vegCount: number
  nonVegCount: number
  prevDayCategories: Set<Category>
  prevDayRegions: Set<Region>
  currentDayCategories: Set<Category>
  currentDayRegions: Set<Region>
}

function scoreRecipe(
  recipe: Recipe,
  day: string,
  meal: MealType,
  ctx: PlanContext,
  allowUsed: boolean,
): number {
  if (!recipe.mealType.includes(meal)) return Number.NEGATIVE_INFINITY
  const alreadyUsed = ctx.usedRecipeIds.has(recipe.id)
  if (alreadyUsed && !allowUsed) return Number.NEGATIVE_INFINITY

  let score = 100
  if (alreadyUsed) score -= 100

  const isWeekend = day === "Saturday" || day === "Sunday"

  if (!isWeekend && meal === "breakfast") {
    if (recipe.tags.includes("quick-breakfast")) score += 50
    if (recipe.cookTime > 20) score -= 40
  }
  if (!isWeekend && (meal === "lunch" || meal === "dinner")) {
    if (recipe.cookTime <= 30) score += 20
    if (recipe.cookTime > 45) score -= 30
  }
  if (isWeekend) {
    if (recipe.tags.includes("weekend-special")) score += 25
    if (recipe.cookTime <= 15) score -= 10
  }

  if (ctx.prevDayCategories.has(recipe.category)) score -= 25
  if (ctx.prevDayRegions.has(recipe.region)) score -= 15

  const catCount = ctx.categoryCount.get(recipe.category) ?? 0
  if (catCount >= 2) score -= 20 * (catCount - 1)

  const regCount = ctx.regionCount.get(recipe.region) ?? 0
  if (regCount >= 3) score -= 15 * (regCount - 2)

  const total = ctx.vegCount + ctx.nonVegCount
  if (total > 0) {
    const vegRatio = ctx.vegCount / total
    if (vegRatio > 0.6 && recipe.isVeg) score -= 20
    if (vegRatio < 0.4 && !recipe.isVeg) score -= 20
  }

  score += Math.random() * 5
  return score
}

function pickForSlot(day: string, meal: MealType, ctx: PlanContext): Recipe | null {
  const pool = getRecipesByMealType(meal)
  if (pool.length === 0) return null

  let scored = pool
    .map((r) => ({ recipe: r, score: scoreRecipe(r, day, meal, ctx, false) }))
    .filter((s) => s.score !== Number.NEGATIVE_INFINITY)

  if (scored.length === 0) {
    scored = pool
      .map((r) => ({ recipe: r, score: scoreRecipe(r, day, meal, ctx, true) }))
      .filter((s) => s.score !== Number.NEGATIVE_INFINITY)
  }

  if (scored.length === 0) return null

  scored.sort((a, b) => b.score - a.score)
  const topN = scored.slice(0, Math.min(3, scored.length))
  return topN[Math.floor(Math.random() * topN.length)].recipe
}

function registerPick(recipe: Recipe, ctx: PlanContext) {
  ctx.usedRecipeIds.add(recipe.id)
  ctx.categoryCount.set(recipe.category, (ctx.categoryCount.get(recipe.category) ?? 0) + 1)
  ctx.regionCount.set(recipe.region, (ctx.regionCount.get(recipe.region) ?? 0) + 1)
  if (recipe.isVeg) ctx.vegCount += 1
  else ctx.nonVegCount += 1
  ctx.currentDayCategories.add(recipe.category)
  ctx.currentDayRegions.add(recipe.region)
}

export function autoSuggestMealPlan(): Record<string, Record<MealType, Recipe | null>> {
  const plan: Record<string, Record<MealType, Recipe | null>> = {}
  const ctx: PlanContext = {
    usedRecipeIds: new Set(),
    categoryCount: new Map(),
    regionCount: new Map(),
    vegCount: 0,
    nonVegCount: 0,
    prevDayCategories: new Set(),
    prevDayRegions: new Set(),
    currentDayCategories: new Set(),
    currentDayRegions: new Set(),
  }

  for (const day of DAYS) {
    ctx.currentDayCategories = new Set()
    ctx.currentDayRegions = new Set()
    const dayPlan: Record<MealType, Recipe | null> = {
      breakfast: null,
      lunch: null,
      dinner: null,
    }
    for (const meal of MEALS) {
      const pick = pickForSlot(day, meal, ctx)
      dayPlan[meal] = pick
      if (pick) registerPick(pick, ctx)
    }
    plan[day] = dayPlan
    ctx.prevDayCategories = ctx.currentDayCategories
    ctx.prevDayRegions = ctx.currentDayRegions
  }

  return plan
}

export { DAYS }
