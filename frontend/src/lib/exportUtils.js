/**
 * Exports data to a CSV file and triggers download
 * 
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the output file
 * @param {Array} columns - Array of column definitions { header: string, accessor: string|function }
 */
export const exportToCSV = (data, filename, columns) => {
  if (!data || !data.length) {
    console.warn("No data to export");
    return;
  }

  // Generate headers
  const headers = columns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(",");

  // Generate rows
  const rows = data.map(row => {
    return columns.map(col => {
      let value = "";
      
      // If accessor is a function, call it (useful for computed values)
      if (typeof col.exportAccessor === "function") {
        value = col.exportAccessor(row);
      } else if (typeof col.accessor === "function") {
        // Fallback to normal accessor if it's a function
        try {
          // If the cell returns React elements, we might not want to use it directly for export,
          // so it's better to provide an exportAccessor. But we'll try evaluating it as string.
          const res = col.accessor(row);
          value = typeof res === 'object' ? '' : res; 
        } catch (e) {
          value = "";
        }
      } else if (typeof col.accessor === "string") {
        // Deep access for nested objects e.g., 'user.name'
        value = col.accessor.split('.').reduce((o, i) => (o ? o[i] : ""), row);
      }
      
      // Handle null/undefined
      if (value === null || value === undefined) value = "";
      
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(",");
  });

  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
