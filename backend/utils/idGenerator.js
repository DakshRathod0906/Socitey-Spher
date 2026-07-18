// Generates human-readable unique codes (e.g., society codes, receipt numbers)
export const generateCode = (prefix) => {
  const random = Math.floor(1000 + Math.random() * 9000);
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}${timestamp}${random}`;
};
