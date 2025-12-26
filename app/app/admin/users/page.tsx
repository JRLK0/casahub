import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { getUsers, getRoles } from "@/lib/user-actions";
import UsersManagement from "./UsersManagement";

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  try {
    await requireAdmin();
  } catch (error) {
    redirect("/app");
  }

  const usersResult = await getUsers();
  const rolesResult = await getRoles();

  const users = usersResult.success ? usersResult.users : [];
  const roles = rolesResult.success ? rolesResult.roles : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Usuarios
          </h2>
          <p className="text-gray-600">
            Administra los usuarios del sistema y sus permisos
          </p>
        </div>

        <UsersManagement initialUsers={users} roles={roles} />
      </div>
    </div>
  );
}

