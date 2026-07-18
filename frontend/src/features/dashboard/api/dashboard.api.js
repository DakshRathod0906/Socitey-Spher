import api from "../../../services/api";

/**
 * Dashboard API Service.
 * All dashboard data-fetching logic lives here.
 * Components never call api directly.
 */

export const fetchAdminDashboard = async () => {
  const { data } = await api.get("/dashboard/admin");
  return data;
};

export const fetchResidentDashboard = async () => {
  const { data } = await api.get("/dashboard/resident");
  return data;
};

export const fetchSuperAdminDashboard = async () => {
  const { data } = await api.get("/dashboard/super-admin");
  return data;
};

export const fetchNotifications = async () => {
  const { data } = await api.get("/dashboard/notifications");
  return data;
};

export const markNotificationAsRead = async (id) => {
  const { data } = await api.put(`/dashboard/notifications/${id}/read`);
  return data;
};
