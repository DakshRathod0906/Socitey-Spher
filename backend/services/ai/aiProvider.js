import axios from "axios";

// Configured via environment variables
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_SERVICE_TIMEOUT = parseInt(process.env.ML_SERVICE_TIMEOUT || "5000", 10);

const aiClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: ML_SERVICE_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

export const checkHealth = async () => {
  try {
    const response = await aiClient.get("/health");
    return response.data;
  } catch (error) {
    throw new Error(`AI Service is unreachable: ${error.message}`);
  }
};

export const predict = async (endpoint, payload) => {
  try {
    const response = await aiClient.post(endpoint, payload);
    return response.data;
  } catch (error) {
    console.error(`[AI_PROVIDER_ERROR] Endpoint: ${endpoint} | Payload:`, payload, `| Error:`, error.message);
    throw error;
  }
};
