import { getRecipe, checkRecipeAvailability } from "@/lib/recipe-actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RecipeDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const [recipeResult, availabilityResult] = await Promise.all([
    getRecipe(id),
    checkRecipeAvailability(id),
  ]);

  if ("error" in recipeResult) {
    if (recipeResult.error === "Receta no encontrada") notFound();
    return <div className="p-8 text-red-500">{recipeResult.error}</div>;
  }

  const { recipe } = recipeResult;
  const availability = "success" in availabilityResult ? availabilityResult : null;

  const statusColors = {
    green: "bg-green-100 text-green-700 border-green-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    red: "bg-red-100 text-red-700 border-red-200",
  };

  const statusLabels = {
    green: "Tienes todos los ingredientes",
    yellow: "Te faltan algunos ingredientes",
    red: "Te faltan muchos ingredientes",
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link 
        href="/app/cocina/recetas"
        className="text-indigo-600 flex items-center gap-1 mb-6 hover:underline text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a recetas
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="h-64 bg-gray-100 relative">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
            <h1 className="text-3xl font-bold text-white mb-2">{recipe.name}</h1>
            <div className="flex gap-6 text-white/90 text-sm">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {recipe.prepTime ? `${recipe.prepTime + (recipe.cookTime || 0)} min` : '-'}
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {recipe.servings || '-'} personas
              </span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredientes</h2>
              {availability && (
                <div className={`mb-6 p-4 rounded-xl border ${statusColors[availability.status]} text-sm font-medium`}>
                  {statusLabels[availability.status]}
                </div>
              )}
              <ul className="space-y-4">
                {recipe.ingredients.map((ing) => {
                  const av = availability?.availability?.find(a => a.name === ing.name);
                  return (
                    <li key={ing.id} className="flex flex-col border-b border-gray-100 pb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-800 font-medium">{ing.name}</span>
                        <span className="text-gray-500 text-sm">{ing.quantity} {ing.unit}</span>
                      </div>
                      {av && (
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${av.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-[10px] text-gray-400">
                            {av.available ? 'En stock' : 'Sin stock suficiente'}
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="md:col-span-2">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Descripción</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{recipe.description || 'Sin descripción'}</p>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Instrucciones</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{recipe.instructions || 'No hay instrucciones detalladas.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

