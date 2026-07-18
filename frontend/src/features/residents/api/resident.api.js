import api from "../../../services/api";
import { extractData, extractMeta, mapUser } from "../../../lib/responseMapper";

/**
 * Resident API Service
 * Handles all communication with the backend for resident management.
 * The mapper is called here so the hooks never see the backend schema.
 */

export const fetchResidents = async (filters = {}) => {
  const { data: rawData } = await api.get("/residents", { params: filters });
  const dataList = extractData({ data: rawData });
  const meta = extractMeta({ data: rawData });
  
  return {
    data: dataList.map(mapUser),
    meta
  };
};

export const fetchResidentById = async (id) => {
  const { data } = await api.get(`/residents/${id}`);
  return mapUser(extractData({ data }));
};

export const inviteResident = async (payload) => {
  const { data } = await api.post("/residents/invite", payload);
  return extractData({ data });
};

export const fetchInvitations = async () => {
  const { data } = await api.get("/residents/invitations");
  return extractData({ data });
};

export const revokeInvitation = async (id) => {
  const { data } = await api.patch(`/residents/invitations/${id}/revoke`);
  return extractData({ data });
};

export const updateResident = async (id, payload) => {
  const { data } = await api.put(`/residents/${id}`, payload);
  return mapUser(extractData({ data }));
};

export const deactivateResident = async (id) => {
  const { data } = await api.patch(`/residents/${id}/status`, { status: "INACTIVE" });
  return extractData({ data });
};
