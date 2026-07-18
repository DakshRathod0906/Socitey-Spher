import api from "../../../services/api";

export const getStatus = async () => {
  const res = await api.get("/setup/status");
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put("/setup/profile", data);
  return res.data;
};

export const saveTowers = async (towers) => {
  const res = await api.post("/setup/towers", { towers });
  return res.data;
};

export const generateFlats = async () => {
  const res = await api.post("/setup/flats");
  return res.data;
};

export const saveAmenities = async (amenities) => {
  const res = await api.post("/setup/amenities", { amenities });
  return res.data;
};

export const saveStaff = async (staff) => {
  const res = await api.post("/setup/staff", { staff });
  return res.data;
};

export const completeSetup = async () => {
  const res = await api.post("/setup/complete");
  return res.data;
};
