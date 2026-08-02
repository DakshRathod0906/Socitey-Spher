import api from "../../../services/api";

export const getAmenities = async () => {
  const { data } = await api.get("/amenities");
  return data.data || data; // Handle both wrapped and unwrapped arrays
};

export const getMyBookings = async () => {
  const { data } = await api.get("/amenities/bookings");
  return data.data || data;
};

export const createBooking = async (payload) => {
  const { data } = await api.post("/amenities/bookings", payload);
  return data.data || data;
};

export const cancelBooking = async (id) => {
  const { data } = await api.put(`/amenities/bookings/${id}/cancel`);
  return data.data || data;
};

// Admin Endpoints
export const createAmenity = async (payload) => {
  const { data } = await api.post("/amenities", payload);
  return data.data || data;
};

export const updateAmenity = async (id, payload) => {
  const { data } = await api.put(`/amenities/${id}`, payload);
  return data.data || data;
};

export const getAllBookings = async () => {
  const { data } = await api.get("/amenities/bookings");
  return data.data || data;
};
