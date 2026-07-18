import api from "../../../services/api";
import { extractData } from "../../../lib/responseMapper";

export const fetchFlats = async () => {
  const { data } = await api.get("/societies/flats");
  return extractData({ data });
};
