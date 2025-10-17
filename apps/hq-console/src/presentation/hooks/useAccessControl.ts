// Presentation Layer - Access Control Hook
import { useState, useEffect } from 'react';
import { UserRole, Permission } from '../../domain/entities/AccessControl';
import { AccessControlService } from '../../application/services/AccessControlService';

export const useAccessControl = (userRole?: UserRole) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(userRole || UserRole.CUSTOMER);

  // Check if user has specific permission
  const hasPermission = (permission: Permission): boolean => {
    return AccessControlService.hasPermission(currentRole, permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return AccessControlService.hasAnyPermission(currentRole, permissions);
  };

  // Check if user has all specified permissions
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return AccessControlService.hasAllPermissions(currentRole, permissions);
  };

  // Check if user can access specific page
  const canAccessPage = (page: string): boolean => {
    return AccessControlService.canAccessPage(currentRole, page);
  };

  // Check if user can perform specific action
  const canPerformAction = (action: string): boolean => {
    return AccessControlService.canPerformAction(currentRole, action);
  };

  // Get user's access control info
  const getAccessControl = () => {
    return AccessControlService.getUserAccessControl(currentRole);
  };

  // Update user role (useful when role changes)
  const updateRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
  };

  return {
    currentRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessPage,
    canPerformAction,
    getAccessControl,
    updateRole,
  };
};

// Higher-order component for protecting routes
export const withAccessControl = (
  WrappedComponent: React.ComponentType<any>,
  requiredPermissions: Permission[]
) => {
  return function AccessControlledComponent(props: any) {
    const { hasAllPermissions } = useAccessControl();

    if (!hasAllPermissions(requiredPermissions)) {
      return (
        <div className="p-lg text-center">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

// Component for conditional rendering based on permissions
interface PermissionGateProps {
  permission: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  permissions = [],
  requireAll = false,
  children,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAccessControl();

  const hasAccess = permissions.length > 0
    ? requireAll
      ? hasAllPermissions([permission, ...permissions])
      : hasAnyPermission([permission, ...permissions])
    : hasPermission(permission);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
