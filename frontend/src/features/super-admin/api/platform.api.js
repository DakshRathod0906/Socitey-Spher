import api from "../../../services/api";
import { extractData } from "../../../lib/responseMapper";

export const fetchPendingSocieties = async () => {
  const { data } = await api.get("/societies/pending");
  return extractData({ data });
};

export const fetchSocietyById = async (id) => {
  const { data } = await api.get(`/societies/${id}`);
  return extractData({ data });
};

export const approveSociety = async (id) => {
  const { data } = await api.patch(`/societies/${id}/approve`);
  return extractData({ data });
};

export const rejectSociety = async (id) => {
  const { data } = await api.patch(`/societies/${id}/reject`);
  return extractData({ data });
};

export const suspendSociety = async (id) => {
  const { data } = await api.patch(`/societies/${id}/suspend`);
  return extractData({ data });
};

export const reactivateSociety = async (id) => {
  const { data } = await api.patch(`/societies/${id}/reactivate`);
  return extractData({ data });
};
