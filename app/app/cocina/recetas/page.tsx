import { getRecipes } from "@/lib/recipe-actions";
import { getProducts } from "@/lib/kitchen-actions";
import RecipesManagement from "./RecipesManagement";

export default async function RecetasPage() {
  const [recipesResult, productsResult] = await Promise.all([
    getRecipes(),
    getProducts(),
  ]);

  if ("error" in recipesResult || "error" in productsResult) {
    return <div className="p-8 text-red-500">Error al cargar recetas</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Recetas</h1>
        <p className="text-gray-500">Guarda tus platos favoritos y comprueba ingredientes</p>
      </div>

      <RecipesManagement 
        initialRecipes={recipesResult.recipes as any} 
        products={productsResult.products || []}
      />
    </div>
  );
}

