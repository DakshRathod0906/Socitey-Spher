import api from "../../../services/api";

export const getStaff = async (filters) => {
  const { data } = await api.get("/users", { params: filters });
  return data; // Returns { data: [...], pagination: {...} }
};

export const getStaffById = async (id) => {
  const { data } = await api.get(`/users/${id}`);
  return data.data || data;
};

export const createStaff = async (staffData) => {
  const { data } = await api.post("/users", staffData);
  return data.data || data;
};

export const updateStaff = async (id, staffData) => {
  const { data } = await api.put(`/users/${id}`, staffData);
  return data.data || data;
};

export const toggleStaffStatus = async (id, accountStatus) => {
  const { data } = await api.put(`/users/${id}/status`, { accountStatus });
  return data.data || data;
};
