import api from "../../../services/api";

export const fetchResidents = async (filters = {}) => {
  const { data } = await api.get("/residents", { params: filters });
  return data;
};

export const fetchUsers = async (filters = {}) => {
  const { data } = await api.get("/users", { params: filters });
  return data;
};

export const deactivateUser = async (id) => {
  const { data } = await api.patch(`/users/${id}/deactivate`);
  return data;
};

export const inviteResident = async (payload) => {
  const { data } = await api.post("/residents/invite", payload);
  return data;
};

export const fetchInvitations = async () => {
  const { data } = await api.get("/residents/invitations");
  return data;
};

export const revokeInvitation = async (id) => {
  const { data } = await api.patch(`/residents/invitations/${id}/revoke`);
  return data;
};
