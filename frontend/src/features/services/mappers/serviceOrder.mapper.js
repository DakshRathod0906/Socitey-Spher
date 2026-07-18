export const mapServiceOrder = (raw) => {
  if (!raw) return null;
  return {
    id: raw._id || raw.id,
    complaintId: raw.complaintId?._id || raw.complaintId,
    complaintTitle: raw.complaintId?.title || "Unknown Complaint",
    complaintCategory: raw.complaintId?.category || "Unknown",
    assignedToName: raw.assignedTo?.name || "Unknown",
    status: raw.status,
    progressNotes: raw.progressNotes || [],
    completionPhotos: raw.completionPhotos || [],
    startedAt: raw.startedAt,
    completedAt: raw.completedAt,
    estimatedDuration: raw.estimatedDuration,
    actualDuration: raw.actualDuration,
    createdAt: raw.createdAt,
  };
};
