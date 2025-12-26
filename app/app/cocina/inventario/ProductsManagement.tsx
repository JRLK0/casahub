"use client";

import { useState } from "react";
import { 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  markProductAsOpened 
} from "@/lib/kitchen-actions";

interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  locationId: string;
  categoryId: string | null;
  expiryDate: Date | null;
  openedAt: Date | null;
  minStock: number | null;
  notes: string | null;
  location: { name: string };
  category?: { name: string } | null;
}

interface ProductsManagementProps {
  initialProducts: Product[];
  locations: { id: string, name: string }[];
  categories: { id: string, name: string }[];
}

export default function ProductsManagement({ 
  initialProducts, 
  locations, 
  categories 
}: ProductsManagementProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const productData = {
      id: editingProduct?.id,
      name: formData.get("name") as string,
      quantity: parseFloat(formData.get("quantity") as string),
      unit: formData.get("unit") as string,
      locationId: formData.get("locationId") as string,
      categoryId: formData.get("categoryId") as string || null,
      expiryDate: formData.get("expiryDate") ? new Date(formData.get("expiryDate") as string) : null,
      minStock: formData.get("minStock") ? parseFloat(formData.get("minStock") as string) : null,
      notes: formData.get("notes") as string || null,
    };

    const result = editingProduct?.id 
      ? await updateProduct(productData as any)
      : await createProduct(productData as any);

    if (result.success) {
      // Simplificación: recargar página o actualizar estado local
      window.location.reload();
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    const result = await deleteProduct(id);
    if (result.success) window.location.reload();
  };

  const handleMarkOpened = async (id: string) => {
    const result = await markProductAsOpened(id);
    if (result.success) window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Listado de Productos</h2>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Producto</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Cantidad</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Ubicación</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Estado</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category?.name || 'Sin categoría'}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {p.quantity} {p.unit}
                  {p.minStock && p.quantity <= p.minStock && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded-full font-bold">STOCK BAJO</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.location.name}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="space-y-1">
                    {p.expiryDate && (
                      <p className={`text-[11px] ${new Date(p.expiryDate) < new Date() ? 'text-red-600' : 'text-gray-500'}`}>
                        Cad: {new Date(p.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                    {p.openedAt ? (
                      <p className="text-[11px] text-blue-600">Abierto: {new Date(p.openedAt).toLocaleDateString()}</p>
                    ) : (
                      <button 
                        onClick={() => handleMarkOpened(p.id)}
                        className="text-[10px] text-indigo-600 hover:underline"
                      >
                        Marcar abierto
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setIsModalOpen(true);
                    }}
                    className="text-gray-400 hover:text-indigo-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editingProduct ? 'Editar' : 'Nuevo'} Producto</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input name="name" defaultValue={editingProduct?.name} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input name="quantity" type="number" step="0.01" defaultValue={editingProduct?.quantity || 1} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                  <input name="unit" defaultValue={editingProduct?.unit || 'unidad'} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                  <select name="locationId" defaultValue={editingProduct?.locationId} required className="w-full px-3 py-2 border rounded-lg">
                    <option value="">Seleccionar...</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select name="categoryId" defaultValue={editingProduct?.categoryId || ""} className="w-full px-3 py-2 border rounded-lg">
                    <option value="">Sin categoría</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caducidad</label>
                  <input name="expiryDate" type="date" defaultValue={editingProduct?.expiryDate ? new Date(editingProduct.expiryDate).toISOString().split('T')[0] : ''} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                  <input name="minStock" type="number" step="0.01" defaultValue={editingProduct?.minStock || ''} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea name="notes" defaultValue={editingProduct?.notes || ''} className="w-full px-3 py-2 border rounded-lg" rows={2}></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancelar</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">
                  {isLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

