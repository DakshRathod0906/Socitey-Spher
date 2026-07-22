import { CHART_COLORS } from "../constants/chartColors";

export const assignColors = (data, colorKey = "palette") => {
  if (!data) return [];
  return data.map((item, index) => ({
    ...item,
    fill: CHART_COLORS[colorKey]?.[index % CHART_COLORS[colorKey].length] || CHART_COLORS.primary,
  }));
};

export const assignStatusColors = (data, statusField = "status") => {
  if (!data) return [];
  return data.map(item => ({
    ...item,
    fill: CHART_COLORS.status[item[statusField]?.toUpperCase()] || CHART_COLORS.gray,
  }));
};
