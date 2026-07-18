import { apiClient } from "../../../services/api/axiosClient.js";
import { mapNotice, extractData } from "../../../lib/responseMapper.js";

export const fetchNotices = async (filters = {}) => {
  const response = await apiClient.get("/api/notices", { params: filters });
  const data = extractData(response);
  return Array.isArray(data) ? data.map(mapNotice) : [];
};

export const createNotice = async (payload) => {
  const response = await apiClient.post("/api/notices", payload);
  return mapNotice(extractData(response));
};

export const updateNotice = async ({ id, payload }) => {
  const response = await apiClient.put(`/api/notices/${id}`, payload);
  return mapNotice(extractData(response));
};

export const deleteNotice = async (id) => {
  const response = await apiClient.delete(`/api/notices/${id}`);
  return extractData(response);
};

export const archiveNotice = async (id) => {
  const response = await apiClient.put(`/api/notices/${id}/archive`);
  return mapNotice(extractData(response));
};

export const uploadNoticeAttachment = async ({ id, file }) => {
  const formData = new FormData();
  formData.append("attachment", file);
  
  const response = await apiClient.post(`/api/notices/${id}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return mapNotice(extractData(response));
};
