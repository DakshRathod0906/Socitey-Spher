import api from "../../../services/api";
import { extractData, mapUser } from "../../../lib/responseMapper";

export const fetchSocietyAdmins = async () => {
  const { data: rawData } = await api.get("/users/admins");
  const dataList = extractData({ data: rawData });
  return dataList.map(mapUser);
};
