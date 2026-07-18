import api from "../../../services/api";
import { extractData, extractMeta, mapVisit } from "../../../lib/responseMapper";

/**
 * Visit API Service
 * Handles all communication with the backend for visit management.
 */

export const fetchVisits = async (filters = {}) => {
  const { data: rawData } = await api.get("/visits", { params: filters });
  const dataList = extractData({ data: rawData });
  const meta = extractMeta({ data: rawData });
  
  return {
    data: dataList.map(mapVisit),
    meta
  };
};

export const fetchVisitById = async (id) => {
  const { data } = await api.get(`/visits/${id}`);
  return mapVisit(extractData({ data }));
};

export const createVisit = async (payload) => {
  const { data } = await api.post("/visits", payload);
  return mapVisit(extractData({ data }));
};

export const cancelVisit = async (id) => {
  // Uses /api/visits/:id/cancel
  const { data } = await api.patch(`/visits/${id}/cancel`);
  return extractData({ data });
};
