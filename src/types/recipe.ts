export type Region = "Kolkata" | "Dhaka" | "London" | "NYC" | "Global"
export type Category = "curry" | "street-food" | "sweet" | "snack" | "rice" | "bread" | "fusion"
export type MealType = "breakfast" | "lunch" | "dinner"
export type Difficulty = "easy" | "medium" | "hard"

export interface Ingredient {
  name: string
  amount: string
  bangaloreSubstitute?: string
  orderLinks?: {
    blinkit?: string
    bigbasket?: string
    swiggy?: string
  }
}

export interface Recipe {
  id: string
  name: string
  bengali?: string
  region: Region
  cookTime: number
  tags: string[]
  category: Category
  mealType: MealType[]
  isVeg: boolean
  difficulty: Difficulty
  ingredients: Ingredient[]
  steps: string[]
  description: string
  image?: string
  prepTime?: number
  prepNote?: string
}

export interface MealPlan {
  [day: string]: {
    breakfast?: Recipe
    lunch?: Recipe
    dinner?: Recipe
  }
}
