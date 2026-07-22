import axios from "axios";

const ANALYTICS_API_URL = "http://localhost:8000/api/v1";

const analyticsClient = axios.create({
  baseURL: ANALYTICS_API_URL,
  headers: { "Content-Type": "application/json" },
});

export const analyticsApi = {
  getDashboard: async () => {
    const { data } = await analyticsClient.get("/dashboard");
    return data;
  },
  getPipeline: async () => {
    const { data } = await analyticsClient.get("/pipeline");
    return data;
  },
  getComplaintsSummary: async () => {
    const { data } = await analyticsClient.get("/complaints/summary");
    return data;
  },
  getExpensesSummary: async () => {
    const { data } = await analyticsClient.get("/expenses/summary");
    return data;
  },
  getVisitorsSummary: async () => {
    const { data } = await analyticsClient.get("/visitors/summary");
    return data;
  },
  getVehiclesSummary: async () => {
    const { data } = await analyticsClient.get("/vehicles/summary");
    return data;
  },
  getUsersSummary: async () => {
    const { data } = await analyticsClient.get("/users/summary");
    return data;
  },
};
