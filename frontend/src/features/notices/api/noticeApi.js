import api from "../../../services/api";

export const getNotices = async (filters = {}) => {
  const { data } = await api.get("/api/notices", { params: filters });
  return data; // Notice backend returns array directly `res.json(notices)`
};

export const createNotice = async (noticeData) => {
  const { data } = await api.post("/api/notices", noticeData);
  return data;
};

export const updateNotice = async ({ id, ...noticeData }) => {
  const { data } = await api.put(`/api/notices/${id}`, noticeData);
  return data;
};

export const deleteNotice = async (id) => {
  const { data } = await api.delete(`/api/notices/${id}`);
  return data;
};

export const archiveNotice = async (id) => {
  const { data } = await api.put(`/api/notices/${id}/archive`);
  return data;
};
