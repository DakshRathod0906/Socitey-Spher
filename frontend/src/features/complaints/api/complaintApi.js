import api from "../../../services/api";

export const getComplaints = async (filters = {}) => {
  const { data } = await api.get("/api/complaints", { params: filters });
  return data.data;
};

export const getComplaint = async (id) => {
  const { data } = await api.get(`/api/complaints/${id}`);
  return data.data;
};

export const createComplaint = async (formData) => {
  const { data } = await api.post("/api/complaints", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

export const cancelComplaint = async (id) => {
  const { data } = await api.post(`/api/complaints/${id}/cancel`);
  return data.data;
};

export const rejectComplaint = async (id, reason) => {
  const { data } = await api.post(`/api/complaints/${id}/reject`, { reason });
  return data.data;
};

export const requestReopen = async (id, reason) => {
  const { data } = await api.post(`/api/complaints/${id}/request-reopen`, { reason });
  return data.data;
};

export const approveReopen = async (id) => {
  const { data } = await api.post(`/api/complaints/${id}/approve-reopen`);
  return data.data;
};

export const rejectReopen = async (id, reason) => {
  const { data } = await api.post(`/api/complaints/${id}/reject-reopen`, { reason });
  return data.data;
};

export const closeComplaint = async (id, { rating, feedback }) => {
  const { data } = await api.post(`/api/complaints/${id}/close`, { rating, feedback });
  return data.data;
};

