import { predict } from "./aiProvider.js";

/**
 * Predicts the category, priority, and confidence for a given complaint.
 * Maps the standard AI Service response to the backend complaint structure.
 * 
 * @param {string} title - The complaint title.
 * @param {string} description - The complaint description.
 * @returns {Promise<Object>} An object containing prediction status and metadata.
 */
export const predictComplaint = async (title, description) => {
  const startTime = Date.now();
  
  try {
    const payload = { title, description };
    
    console.log(`[ML_REQUEST] Complaint Prediction | Title: "${title}" | Time: ${new Date().toISOString()}`);
    
    // Call the Python ML Service
    const data = await predict("/predict/complaint", payload);
    
    const predictionTimeMs = Date.now() - startTime;
    console.log(`[ML_RESPONSE] Complaint Prediction Success | TimeMs: ${predictionTimeMs} | Confidence: ${data.prediction?.confidence}`);

    if (data && data.success && data.prediction) {
      return {
        predictionStatus: "COMPLETED",
        aiCategory: data.prediction.category || "other",
        aiPriority: data.prediction.priority || "medium",
        aiConfidence: data.prediction.confidence || 0,
        modelVersion: data.meta?.modelVersion || "1.0.0",
        predictedAt: new Date(),
        predictionTimeMs,
      };
    } else {
      throw new Error("Invalid response schema from ML service");
    }
  } catch (error) {
    const predictionTimeMs = Date.now() - startTime;
    console.error(`[ML_ERROR] Complaint Prediction Failed | TimeMs: ${predictionTimeMs} | Error:`, error.message);
    
    // Fallback if the service is unreachable or times out
    return {
      predictionStatus: "PENDING",
      predictionTimeMs,
      // Leaving aiCategory/aiPriority undefined allows the controller or DB defaults to take over,
      // but marking it PENDING means a background job can retry later.
    };
  }
};
