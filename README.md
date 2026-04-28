## Bengali Kitchen BLR

A Bengali recipe web app built for Bengalis living in Bangalore — helping you cook authentic home food with ingredients you can actually find locally. Check it out at [bengali-kitchen-blr.vercel.app](https://bengali-kitchen-blr.vercel.app/)

---

## What It Does

- **Weekly Meal Planner** — Auto-generates a Bengali meal plan for the week. Weekdays get quick recipes (≤30 min), weekends get the elaborate ones. Swap any meal and generate a combined shopping list.
- **Recipe Browser** — Browse and filter all recipes by category, meal type, dietary preference (veg/non-veg), cook time, and tags.
- **Recipe Detail Pages** — Each recipe includes the Bengali name (in Bengali script), region of origin, difficulty, full ingredient list with **Bangalore-specific substitutes** (e.g. where to find Hilsa at KR Market), and quick order links for Blinkit, BigBasket, and Swiggy.

---

## Product Thinking

### The Problem
Bengalis in Bangalore want to cook home food — but the recipes online assume you're in Kolkata. You search for "shorshe ilish" and get a list of ingredients you can't find at your local supermarket. The cuisine is hyper-local, and the ingredient supply chain doesn't follow you when you move cities.

### The Design Decisions

**1. Locality as a first-class feature**
Every ingredient has a `bangaloreSubstitute` field. This isn't an afterthought — it's in the data schema. The insight: the recipe itself doesn't change, but the *sourcing* is what breaks down when you're 2000km from home. We made that the primary problem to solve.

**2. Time-aware meal planning**
Weekdays are constrained (≤30 min). Weekends aren't. The planner encodes this as a hard filter, not a suggestion. This respects real life — you don't need a planning app that ignores Monday mornings.

**3. Static data, zero backend**
All recipe data lives in a single `data/recipes.json`. No database, no API, no auth. This was a deliberate scope decision: the content is curated and stable, so a static file is faster to build, cheaper to host, and easier to reason about. We can always migrate later.

**4. Direct commerce links**
Each ingredient links directly to Blinkit, BigBasket, and Swiggy search results. The friction between "I want to cook this" and "I have the ingredients" is the drop-off point. We try to close that gap in one tap.

**5. Bengali script as identity, not decoration**
Every recipe shows the Bengali name in script (e.g. সর্ষে ইলিশ). It's not just aesthetic — it signals who this is for. Diaspora products often strip cultural identity to feel "universal." We went the other way.

---

## Built With Claude Code

This entire app — data schema, components, meal planner logic, and deploy config — was built using [Claude Code](https://claude.ai/code). The workflow:

1. Describe the product problem in plain language
2. Claude scaffolds the data model and Next.js structure
3. Iterate on features conversationally, with Claude writing and editing code directly
4. Ship

If you're curious about building something similar, the barrier is lower than you think. Pick a hyper-specific audience with a real problem, and start with the data model. The rest follows.

---

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router) with TypeScript
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
