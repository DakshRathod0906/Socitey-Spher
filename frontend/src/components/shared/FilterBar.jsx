import { Search, Filter, Plus } from "lucide-react";
import { cn } from "../../lib/utils";
import { Input, Button, Dropdown } from "../ui";

export default function FilterBar({
  onSearch,
  searchPlaceholder = "Search...",
  filters = [],
  actionButton,
  className,
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 mb-6", className)}>
      <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-9 w-full"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
        
        {filters.length > 0 && (
          <div className="flex items-center gap-2">
            {filters.map((filter, index) => (
              <Dropdown
                key={index}
                items={filter.options}
                trigger={
                  <Button variant="outline" size="md" className="gap-2">
                    {filter.icon && <filter.icon className="h-4 w-4" />}
                    {!filter.icon && <Filter className="h-4 w-4" />}
                    <span className="hidden sm:inline">{filter.label}</span>
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </div>

      {actionButton && (
        <div className="shrink-0 w-full sm:w-auto">
          <Button
            onClick={actionButton.onClick}
            variant={actionButton.variant || "primary"}
            className="w-full sm:w-auto gap-2"
          >
            {actionButton.icon && <actionButton.icon className="h-4 w-4" />}
            {!actionButton.icon && <Plus className="h-4 w-4" />}
            {actionButton.label}
          </Button>
        </div>
      )}
    </div>
  );
}
