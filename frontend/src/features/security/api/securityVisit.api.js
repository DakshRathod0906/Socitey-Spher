import api from "../../../services/api";

export const fetchTodayMetrics = async () => {
  const { data } = await api.get("/visitors/today");
  return data;
};

export const verifyVisit = async (qrToken) => {
  const { data } = await api.post("/visitors/verify", { qrToken });
  return data;
};

export const checkInVisit = async (checkInData) => {
  const { data } = await api.post("/visitors/check-in", checkInData);
  return data;
};

export const checkOutVisit = async (visitId) => {
  const { data } = await api.post(`/visitors/${visitId}/check-out`);
  return data;
};

export const requestWalkIn = async (walkInData) => {
  const { data } = await api.post("/visitors/gate-request", walkInData);
  return data;
};
