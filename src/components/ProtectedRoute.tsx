import { Navigate } from "react-router-dom";
import useContextPro from "../hooks/useContextPro";
import type { UserRole } from "../types/types";

interface Props {
  role: UserRole | UserRole[];
  children: React.ReactNode;
}
function ProtectedRoute({ role, children }: Props) {
  const {
    state: { user, isLoading },
  } = useContextPro();

  const allowedRoles = Array.isArray(role) ? role : [role];

  if (isLoading) {
    return null;
  }

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "teacher" ? "/admin/groups" : user.role === "student" ? "/student" : "/admin"} replace />;
  }

  return children;
}

export default ProtectedRoute;
