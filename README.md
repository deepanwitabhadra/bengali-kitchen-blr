## Getting Started

A Bengali recipe web app built for Bengalis living in Bangalore — helping you cook authentic home food with ingredients you can actually find locally. Check it out on https://bengali-kitchen-blr.vercel.app/

## What It Does

- **Weekly Meal Planner** — Auto-generates a Bengali meal plan for the week. Weekdays get quick recipes (≤30 min), weekends get the elaborate ones. Swap any meal and generate a combined shopping list.
- **Recipe Browser** — Browse and filter all recipes by category, meal type, dietary preference (veg/non-veg), cook time, and tags.
- **Recipe Detail Pages** — Each recipe includes the Bengali name (in Bengali script), region of origin, difficulty, full ingredient list with **Bangalore-specific substitutes** (e.g. where to find Hilsa at KR Market), and quick order links for Blinkit, BigBasket, and Swiggy.

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router) with TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- React 19
- Recipe data in a local JSON file (`data/recipes.json`)


## Project Structure

```
src/
  app/               # Next.js App Router pages
    page.tsx         # Home — Weekly Meal Planner
    recipes/         # Recipe browser with filters
    recipe/[slug]/   # Individual recipe detail page
    meal-planner/    # Meal planner logic
  components/        # UI components (RecipeCard, FilterBar, MealPlannerGrid, etc.)
  lib/               # Data helpers
  types/             # TypeScript types
data/
  recipes.json       # All recipe data
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
