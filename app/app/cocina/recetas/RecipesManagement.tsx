"use client";

import { useState } from "react";
import { createRecipe, updateRecipe, deleteRecipe } from "@/lib/recipe-actions";
import Link from "next/link";

interface Recipe {
  id: string;
  name: string;
  description: string | null;
  servings: number | null;
  prepTime: number | null;
  cookTime: number | null;
  imageUrl: string | null;
  ingredients: any[];
}

interface RecipesManagementProps {
  initialRecipes: Recipe[];
  products: { id: string, name: string }[];
}

export default function RecipesManagement({ initialRecipes, products }: RecipesManagementProps) {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Partial<Recipe> | null>(null);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: 1, unit: "unidad", productId: null }]);
  };

  const handleIngredientChange = (index: number, field: string, value: any) => {
    const newIng = [...ingredients];
    newIng[index][field] = value;
    setIngredients(newIng);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const recipeData = {
      id: editingRecipe?.id,
      name: formData.get("name") as string,
      description: formData.get("description") as string || null,
      instructions: formData.get("instructions") as string || null,
      servings: formData.get("servings") ? parseInt(formData.get("servings") as string) : null,
      prepTime: formData.get("prepTime") ? parseInt(formData.get("prepTime") as string) : null,
      cookTime: formData.get("cookTime") ? parseInt(formData.get("cookTime") as string) : null,
      ingredients: ingredients,
    };

    const result = editingRecipe?.id 
      ? await updateRecipe(recipeData as any)
      : await createRecipe(recipeData as any);

    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta receta?")) return;
    const result = await deleteRecipe(id);
    if (result.success) window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Recetario</h2>
        <button
          onClick={() => {
            setEditingRecipe(null);
            setIngredients([{ name: "", quantity: 1, unit: "unidad", productId: null }]);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Nueva Receta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="h-40 bg-gray-100 flex items-center justify-center">
              {r.imageUrl ? (
                <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{r.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{r.description || 'Sin descripción'}</p>
              
              <div className="flex gap-4 text-xs text-gray-400 mb-6">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {r.prepTime ? `${r.prepTime + (r.cookTime || 0)} min` : '-'}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {r.servings || '-'} pers
                </span>
              </div>

              <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                <Link 
                  href={`/app/cocina/recetas/${r.id}`}
                  className="text-indigo-600 font-medium hover:text-indigo-700 text-sm"
                >
                  Ver Receta
                </Link>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setEditingRecipe(r);
                      setIngredients(r.ingredients.map(ing => ({
                        name: ing.name,
                        quantity: ing.quantity,
                        unit: ing.unit,
                        productId: ing.productId
                      })));
                      setIsModalOpen(true);
                    }}
                    className="text-gray-400 hover:text-indigo-600 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-gray-400 hover:text-red-600 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editingRecipe ? 'Editar' : 'Nueva'} Receta</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input name="name" defaultValue={editingRecipe?.name} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea name="description" defaultValue={editingRecipe?.description || ''} className="w-full px-3 py-2 border rounded-lg" rows={2}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personas</label>
                  <input name="servings" type="number" defaultValue={editingRecipe?.servings || ''} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prep (min)</label>
                    <input name="prepTime" type="number" defaultValue={editingRecipe?.prepTime || ''} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cocción</label>
                    <input name="cookTime" type="number" defaultValue={editingRecipe?.cookTime || ''} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ingredientes</label>
                <div className="space-y-2">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <input 
                          placeholder="Ingrediente"
                          value={ing.name}
                          onChange={(e) => handleIngredientChange(idx, "name", e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border rounded-lg"
                        />
                      </div>
                      <div className="w-16">
                        <input 
                          type="number"
                          step="0.01"
                          placeholder="Cant"
                          value={ing.quantity}
                          onChange={(e) => handleIngredientChange(idx, "quantity", parseFloat(e.target.value))}
                          className="w-full px-2 py-1.5 text-sm border rounded-lg"
                        />
                      </div>
                      <div className="w-20">
                        <input 
                          placeholder="Unid"
                          value={ing.unit}
                          onChange={(e) => handleIngredientChange(idx, "unit", e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <select 
                          value={ing.productId || ""}
                          onChange={(e) => handleIngredientChange(idx, "productId", e.target.value || null)}
                          className="w-full px-2 py-1.5 text-sm border rounded-lg"
                        >
                          <option value="">Vincular producto...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveIngredient(idx)}
                        className="text-red-500 p-1.5"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={handleAddIngredient}
                    className="text-xs text-indigo-600 font-medium hover:underline"
                  >
                    + Añadir ingrediente
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instrucciones</label>
                <textarea name="instructions" defaultValue={editingRecipe?.instructions || ''} className="w-full px-3 py-2 border rounded-lg" rows={4}></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancelar</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">
                  {isLoading ? 'Guardando...' : 'Guardar Receta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

