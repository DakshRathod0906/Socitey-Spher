import api from "../../../services/api";
import { extractData, mapUser } from "../../../lib/responseMapper";

export const fetchUsers = async (filters = {}) => {
  const { data: rawData } = await api.get("/users", { params: filters });
  const dataList = extractData({ data: rawData });
  return dataList.map(mapUser);
};

export const deactivateUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return extractData({ data });
};
