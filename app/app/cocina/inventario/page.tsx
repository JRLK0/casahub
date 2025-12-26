import { getProducts, getKitchenMetadata } from "@/lib/kitchen-actions";
import ProductsManagement from "./ProductsManagement";

export default async function InventarioPage() {
  const [productsResult, metadataResult] = await Promise.all([
    getProducts(),
    getKitchenMetadata(),
  ]);

  if ("error" in productsResult || "error" in metadataResult) {
    return <div className="p-8 text-red-500">Error al cargar datos</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventario de Cocina</h1>
        <p className="text-gray-500">Gestiona los productos, su ubicación y estado</p>
      </div>

      <ProductsManagement 
        initialProducts={productsResult.products as any} 
        locations={metadataResult.locations || []}
        categories={metadataResult.categories || []}
      />
    </div>
  );
}

