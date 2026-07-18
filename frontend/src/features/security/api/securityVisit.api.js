import api from "../../../services/api";

export const fetchTodayMetrics = async () => {
  const { data } = await api.get("/visits/today");
  return data;
};

export const verifyVisit = async (qrToken) => {
  const { data } = await api.post("/visits/verify", { qrToken });
  return data;
};

export const checkInVisit = async (checkInData) => {
  const { data } = await api.post("/visits/check-in", checkInData);
  return data;
};

export const checkOutVisit = async (visitId) => {
  const { data } = await api.post(`/visits/${visitId}/check-out`);
  return data;
};

export const requestWalkIn = async (walkInData) => {
  const { data } = await api.post("/visits/gate-request", walkInData);
  return data;
};
