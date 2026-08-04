import api from "../../../services/api";

export const getParkingSlots = async (filters) => {
  const { data } = await api.get("/parking/slots", { params: filters });
  return data;
};

export const createParkingSlot = async (slotData) => {
  const { data } = await api.post("/parking/slots", slotData);
  return data;
};

export const registerVehicle = async (vehicleData) => {
  const { data } = await api.post("/parking/vehicles", vehicleData);
  return data;
};

export const getVehicles = async () => {
  const { data } = await api.get("/parking/vehicles");
  return data;
};

export const allocateParkingSlot = async ({ slotId, userId, vehicleId }) => {
  const { data } = await api.post(`/parking/slots/${slotId}/allocate`, { userId, vehicleId });
  return data;
};

export const updateSlotOccupancy = async ({ slotId, isOccupied }) => {
  const { data } = await api.put(`/parking/slots/${slotId}/occupancy`, { isOccupied });
  return data;
};

export const unassignParkingSlot = async (slotId) => {
  const { data } = await api.post(`/parking/slots/${slotId}/unassign`);
  return data;
};

export const deleteParkingSlot = async (slotId) => {
  const { data } = await api.delete(`/parking/slots/${slotId}`);
  return data;
};
