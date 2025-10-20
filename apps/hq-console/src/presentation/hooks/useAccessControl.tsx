"use client";

import React, { useState } from 'react';
import { UserRole, Permission } from '../../domain/entities/AccessControl';
import { AccessControlService } from '../../application/services/AccessControlService';

export const useAccessControl = (userRole?: UserRole) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(userRole || UserRole.CUSTOMER);

  const hasPermission = (permission: Permission): boolean => {
    return AccessControlService.hasPermission(currentRole, permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return AccessControlService.hasAnyPermission(currentRole, permissions);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return AccessControlService.hasAllPermissions(currentRole, permissions);
  };

  const canAccessPage = (page: string): boolean => {
    return AccessControlService.canAccessPage(currentRole, page);
  };

  const canPerformAction = (action: string): boolean => {
    return AccessControlService.canPerformAction(currentRole, action);
  };

  const getAccessControl = () => {
    return AccessControlService.getUserAccessControl(currentRole);
  };

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


