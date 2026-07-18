export const mapComplaint = (raw) => {
  if (!raw) return null;
  return {
    id: raw._id || raw.id,
    title: raw.title,
    description: raw.description,
    category: raw.category,
    priority: raw.priority,
    status: raw.status,
    residentName: raw.residentId?.name || "Unknown",
    flatNumber: raw.flatId?.flatNumber || "N/A",
    assignedTo: raw.assignedTo?.name || null,
    assignedAt: raw.assignedAt,
    resolvedAt: raw.resolvedAt,
    closedAt: raw.closedAt,
    residentRating: raw.residentRating,
    residentFeedback: raw.residentFeedback,
    attachments: raw.attachments || [],
    timeline: raw.timeline || [],
    // AI fields
    predictionStatus: raw.predictionStatus,
    aiCategory: raw.aiCategory,
    aiPriority: raw.aiPriority,
    aiConfidence: raw.aiConfidence,
    aiOverridden: raw.aiOverridden,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};
