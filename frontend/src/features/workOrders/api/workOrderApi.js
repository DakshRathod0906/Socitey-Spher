import api from "../../../services/api";

export const getActiveWorkOrders = async () => {
  const { data } = await api.get("/api/work-orders/active");
  return data.data;
};

export const startWorkOrder = async (id) => {
  const { data } = await api.patch(`/api/work-orders/${id}/start`);
  return data.data;
};

export const resolveWorkOrder = async (id, formData) => {
  const { data } = await api.patch(`/api/work-orders/${id}/resolve`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};
