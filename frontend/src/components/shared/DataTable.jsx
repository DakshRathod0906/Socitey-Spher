import { useState, useMemo } from "react";
import { cn } from "../../lib/utils";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { EmptyState, SkeletonTable } from "../feedback";
import { Button } from "../ui";

export default function DataTable({
  columns,
  data = [],
  isLoading = false,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your filters or search query.",
  emptyAction,
  emptyActionLabel,
  pagination = true,
  itemsPerPage = 10,
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  className,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key, sortable) => {
    if (!sortable) return;
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = pagination
    ? sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : sortedData;

  const handleSelectAll = (e) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      const newSelected = new Set(selectedRows);
      paginatedData.forEach(row => newSelected.add(row.id || row._id));
      onSelectionChange(Array.from(newSelected));
    } else {
      const newSelected = new Set(selectedRows);
      paginatedData.forEach(row => newSelected.delete(row.id || row._id));
      onSelectionChange(Array.from(newSelected));
    }
  };

  const handleSelectRow = (e, rowId) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    const newSelected = new Set(selectedRows);
    if (e.target.checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    onSelectionChange(Array.from(newSelected));
  };

  const isAllSelected = paginatedData.length > 0 && paginatedData.every(row => selectedRows.includes(row.id || row._id));
  const isSomeSelected = paginatedData.some(row => selectedRows.includes(row.id || row._id));

  if (isLoading) {
    return (
      <div className={cn("bg-card rounded-xl border border-border overflow-hidden", className)}>
        <SkeletonTable rows={itemsPerPage} cols={columns.length} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn("bg-card rounded-xl border border-border", className)}>
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
          actionLabel={emptyActionLabel}
        />
      </div>
    );
  }

  return (
    <div className={cn("bg-card rounded-xl border border-border overflow-hidden flex flex-col", className)}>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted bg-secondary-light/50 border-b border-border uppercase">
            <tr>
              {selectable && (
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    checked={isAllSelected}
                    ref={input => { if (input) input.indeterminate = isSomeSelected && !isAllSelected; }}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-6 py-4 font-semibold tracking-wider",
                    col.sortable && "cursor-pointer hover:bg-secondary-light transition-colors select-none",
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                    col.className
                  )}
                  onClick={() => handleSort(col.accessor, col.sortable)}
                >
                  <div className={cn("flex items-center gap-1", 
                    col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : "justify-start"
                  )}>
                    {col.header}
                    {col.sortable && sortConfig.key === col.accessor && (
                      sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={row.id || row._id || rowIndex}
                className={cn(
                  "hover:bg-secondary-light/30 transition-colors",
                  onRowClick && "cursor-pointer",
                  selectedRows.includes(row.id || row._id) && "bg-primary-light/10"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      checked={selectedRows.includes(row.id || row._id)}
                      onChange={(e) => handleSelectRow(e, row.id || row._id)}
                    />
                  </td>
                )}
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn(
                      "px-6 py-4 whitespace-nowrap text-text",
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                      col.cellClassName
                    )}
                  >
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-surface/50">
          <span className="text-sm text-muted">
            Showing <span className="font-medium text-text">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-medium text-text">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of{" "}
            <span className="font-medium text-text">{sortedData.length}</span> results
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm font-medium text-text px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
