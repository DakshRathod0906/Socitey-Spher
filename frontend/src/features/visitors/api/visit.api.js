import api from "../../../services/api";
import { extractData, extractMeta, mapVisit } from "../../../lib/responseMapper";

/**
 * Visit API Service
 * Handles all communication with the backend for visit management.
 */

export const fetchVisits = async (filters = {}) => {
  const { data: rawData } = await api.get("/visitors", { params: filters });
  const dataList = extractData({ data: rawData });
  const meta = extractMeta({ data: rawData });
  
  return {
    data: dataList.map(mapVisit),
    meta
  };
};

export const fetchVisitById = async (id) => {
  const { data } = await api.get(`/visitors/${id}`);
  return mapVisit(extractData({ data }));
};

export const createVisit = async (payload) => {
  const { data } = await api.post("/visitors", payload);
  return mapVisit(extractData({ data }));
};

export const cancelVisit = async (id) => {
  const { data } = await api.patch(`/visitors/${id}/cancel`);
  return extractData({ data });
};
