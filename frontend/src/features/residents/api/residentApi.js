import api from "../../../services/api";

export const fetchResidents = async (filters = {}) => {
  const { data } = await api.get("/api/residents", { params: filters });
  return data;
};

export const fetchUsers = async (filters = {}) => {
  const { data } = await api.get("/api/users", { params: filters });
  return data;
};

export const deactivateUser = async (id) => {
  const { data } = await api.delete(`/api/users/${id}`);
  return data;
};

export const inviteResident = async (payload) => {
  const { data } = await api.post("/api/residents/invite", payload);
  return data;
};

export const fetchInvitations = async () => {
  const { data } = await api.get("/api/residents/invitations");
  return data;
};

export const revokeInvitation = async (id) => {
  const { data } = await api.patch(`/api/residents/invitations/${id}/revoke`);
  return data;
};
