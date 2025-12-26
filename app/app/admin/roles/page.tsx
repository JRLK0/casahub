import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { getRoles } from "@/lib/role-actions";
import RolesManagement from "./RolesManagement";

export default async function RolesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  try {
    await requireAdmin();
  } catch (error) {
    redirect("/app");
  }

  const rolesResult = await getRoles();
  const roles = rolesResult.success ? rolesResult.roles : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Roles
          </h2>
          <p className="text-gray-600">
            Administra los roles del sistema y sus descripciones
          </p>
        </div>

        <RolesManagement initialRoles={roles as any} />
      </div>
    </div>
  );
}

