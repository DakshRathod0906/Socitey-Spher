/**
 * Response Mapper — transforms raw backend responses into
 * standardized frontend models.
 *
 * Since the backend returns mixed formats (raw arrays, { message, data }, etc.),
 * this layer ensures React components always receive a predictable shape.
 *
 * Add mappers here as backend response contracts are discovered during integration.
 */

/**
 * Extracts the data payload from a backend response.
 * Handles both { data: [...] } envelope and raw array responses.
 */
export const extractData = (response) => {
  const body = response.data;
  if (body && typeof body === "object" && "data" in body) {
    return body.data;
  }
  return body;
};

/**
 * Extracts pagination metadata from a response if present.
 */
export const extractMeta = (response) => {
  const body = response.data;
  if (body && typeof body === "object" && "meta" in body) {
    return body.meta;
  }
  return null;
};

/**
 * Maps a backend user object to the frontend user model.
 * Backend may use _id, id, or nested structures.
 */
export const mapUser = (raw) => {
  if (!raw) return null;
  return {
    id: raw._id || raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    phone: raw.phone,
    societyId: raw.societyId,
    flatId: raw.flatId,
    accountStatus: raw.accountStatus,
    avatar: raw.avatar || null,
  };
};

/**
 * Maps a backend complaint object to the frontend model.
 */
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

/**
 * Maps a backend visit object to the frontend model.
 */
export const mapVisit = (raw) => {
  if (!raw) return null;
  return {
    id: raw._id || raw.id,
    visitorName: raw.visitorId?.name || "Unknown",
    visitorPhone: raw.visitorId?.phone || "",
    visitorType: raw.visitorId?.visitorType || "GUEST",
    flatNumber: raw.flatId?.flatNumber || "N/A",
    residentName: raw.residentUserId?.name || "Unknown",
    purpose: raw.purpose,
    status: raw.status, // "PENDING", "APPROVED", "CHECKED_IN", "CHECKED_OUT", "REJECTED", "EXPIRED", "CANCELLED"
    passCode: raw.passCode, // Secure token for QR
    expectedArrival: raw.expectedArrival,
    validUntil: raw.validUntil,
    checkInTime: raw.checkInTime,
    checkOutTime: raw.checkOutTime,
    createdAt: raw.createdAt,
  };
};

/**
 * Maps a backend work order object to the frontend service order model.
 */
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

/**
 * Maps a backend notice object.
 */
export const mapNotice = (raw) => {
  if (!raw) return null;
  return {
    id: raw._id || raw.id,
    title: raw.title,
    content: raw.content,
    priority: raw.priority || "LOW",
    category: raw.category || "General",
    audience: raw.audience || ["all"],
    createdBy: raw.createdBy?.name || "Admin",
    updatedBy: raw.updatedBy?.name || null,
    isPinned: raw.isPinned,
    isArchived: raw.isArchived,
    publishDate: raw.publishDate,
    expiryDate: raw.expiryDate,
    pinUntil: raw.pinUntil,
    attachmentUrl: raw.attachmentUrl,
    attachments: raw.attachments || [],
    createdAt: raw.createdAt,
  };
};
