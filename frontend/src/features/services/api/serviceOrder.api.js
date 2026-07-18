import { apiClient } from "../../../services/api/axiosClient.js";
import { mapServiceOrder, extractData } from "../../../lib/responseMapper.js";

/**
 * Fetch all service orders
 */
export const fetchServiceOrders = async (filters = {}) => {
  const response = await apiClient.get("/api/service-orders", { params: filters });
  const data = extractData(response);
  return Array.isArray(data) ? data.map(mapServiceOrder) : [];
};

/**
 * Accept a service order
 */
export const acceptServiceOrder = async (id) => {
  const response = await apiClient.put(`/api/service-orders/${id}/accept`);
  return mapServiceOrder(extractData(response));
};

/**
 * Update progress of a service order
 */
export const updateProgress = async ({ id, note }) => {
  const response = await apiClient.put(`/api/service-orders/${id}/progress`, { note });
  return mapServiceOrder(extractData(response));
};

/**
 * Complete a service order
 */
export const completeServiceOrder = async (id) => {
  const response = await apiClient.put(`/api/service-orders/${id}/complete`);
  return mapServiceOrder(extractData(response).workOrder);
};

/**
 * Upload a completion photo
 */
export const uploadCompletionPhoto = async ({ id, file }) => {
  const formData = new FormData();
  formData.append("photo", file);
  
  const response = await apiClient.put(`/api/service-orders/${id}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return mapServiceOrder(extractData(response));
};
