/**
 * Permission Helpers.
 * Centralized authorization logic for UI rendering and feature gating.
 * Avoids scattered `user.role === "..."` checks across components.
 */

// Core Roles
export const isSuperAdmin = (user) => user?.role === "super_admin";
export const isSocietyAdmin = (user) => user?.role === "society_admin";
export const isResident = (user) => user?.role === "resident";
export const isSecurity = (user) => user?.role === "security";
export const isServiceStaff = (user) => user?.role === "service_staff";

// Feature Permissions
export const canManageSocieties = (user) => isSuperAdmin(user);

export const canManageResidents = (user) => isSocietyAdmin(user);
export const canApproveVisitors = (user) => isResident(user) || isSocietyAdmin(user);
export const canGateCheckVisitors = (user) => isSecurity(user) || isSocietyAdmin(user);

export const canCreateComplaints = (user) => isResident(user) || isSocietyAdmin(user);
export const canAssignComplaints = (user) => isSocietyAdmin(user);
export const canUpdateServiceOrders = (user) => isServiceStaff(user);

export const canGenerateBills = (user) => isSocietyAdmin(user);
export const canPayBills = (user) => isResident(user);

export const canManageParking = (user) => isSocietyAdmin(user);
export const canViewParking = (user) => isResident(user) || isSocietyAdmin(user) || isSecurity(user);

export const canManageNotices = (user) => isSocietyAdmin(user) || isSuperAdmin(user);

export const canViewReports = (user) => isSocietyAdmin(user) || isSuperAdmin(user);
