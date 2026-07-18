import { useState } from "react";
import { cn } from "../../lib/utils";

export default function Tabs({
  tabs = [],
  defaultValue,
  onChange,
  className,
}) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value);

  const handleTabClick = (value) => {
    setActiveTab(value);
    onChange?.(value);
  };

  const activeContent = tabs.find((t) => t.value === activeTab)?.content;

  return (
    <div className={cn(className)}>
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors duration-fast",
              "border-b-2 -mb-px",
              "hover:text-text",
              activeTab === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted"
            )}
          >
            {tab.icon && <tab.icon className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
                activeTab === tab.value
                  ? "bg-primary-light text-primary"
                  : "bg-secondary-light text-muted"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {activeContent && (
        <div className="pt-4 animate-fade-in">{activeContent}</div>
      )}
    </div>
  );
}
