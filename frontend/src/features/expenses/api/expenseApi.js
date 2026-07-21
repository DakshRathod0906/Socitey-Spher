import api from "../../../services/api";

export const getExpenses = async (filters = {}) => {
  const { data } = await api.get("/api/expenses", { params: filters });
  return data.data; // data { expenses, total, pages, currentPage }
};

export const getExpense = async (id) => {
  const { data } = await api.get(`/api/expenses/${id}`);
  return data.data;
};

export const createExpense = async (expenseData) => {
  const { data } = await api.post("/api/expenses", expenseData);
  return data.data;
};
