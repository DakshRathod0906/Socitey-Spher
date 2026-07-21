import api from "../../../services/api";

export const getAmenities = async () => {
  const { data } = await api.get("/api/amenities");
  return data; // standard array return if the endpoint does not wrap in 'data' key? Let's check backend if it wraps.
};

export const getMyBookings = async () => {
  const { data } = await api.get("/api/amenities/bookings");
  return data;
};

export const createBooking = async (payload) => {
  const { data } = await api.post("/api/amenities/bookings", payload);
  return data;
};

export const cancelBooking = async (id) => {
  const { data } = await api.put(`/api/amenities/bookings/${id}/cancel`);
  return data;
};

// Admin Endpoints
export const createAmenity = async (payload) => {
  const { data } = await api.post("/api/amenities", payload);
  return data;
};

export const updateAmenity = async (id, payload) => {
  const { data } = await api.put(`/api/amenities/${id}`, payload);
  return data;
};

export const getAllBookings = async () => {
  const { data } = await api.get("/api/amenities/bookings");
  return data;
};
