import { apiClient } from "../../../services/api/axiosClient.js";
import { mapComplaint, extractData } from "../../../lib/responseMapper.js";

/**
 * Fetch all complaints (scoped by role via backend)
 */
export const fetchComplaints = async (filters = {}) => {
  const response = await apiClient.get("/api/complaints", { params: filters });
  const data = extractData(response);
  return Array.isArray(data) ? data.map(mapComplaint) : [];
};

/**
 * Fetch a single complaint by ID
 */
export const fetchComplaint = async (id) => {
  const response = await apiClient.get(`/api/complaints/${id}`);
  return mapComplaint(extractData(response));
};

/**
 * Create a new complaint (triggers AI prediction)
 */
export const createComplaint = async (payload) => {
  const response = await apiClient.post("/api/complaints", payload);
  return mapComplaint(extractData(response));
};

/**
 * Assign complaint to service staff
 */
export const assignComplaint = async ({ id, staffId }) => {
  const response = await apiClient.put(`/api/complaints/${id}/assign`, { staffId });
  return mapComplaint(extractData(response).complaint);
};

/**
 * Submit feedback on a completed complaint
 */
export const submitFeedback = async ({ id, rating, feedback }) => {
  const response = await apiClient.put(`/api/complaints/${id}/feedback`, { 
    residentRating: rating, 
    residentFeedback: feedback 
  });
  return mapComplaint(extractData(response));
};

/**
 * Upload an attachment for a complaint
 */
export const uploadAttachment = async ({ id, file }) => {
  const formData = new FormData();
  formData.append("attachment", file);
  
  const response = await apiClient.post(`/api/complaints/${id}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return mapComplaint(extractData(response));
};
