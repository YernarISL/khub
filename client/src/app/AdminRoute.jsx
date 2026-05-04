import React from "react";
import RoleRoute from "./RoleRoute";
import { ROLES } from "../shared/constants/roles";

const AdminRoute = () => <RoleRoute allowedRoles={[ROLES.ADMIN]} />;

export default AdminRoute;
